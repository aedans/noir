import { Deck } from "../common/decks.js";
import {
  GameAction,
  GameState,
  PlayerId,
  Winner,
  gameSlice,
  initialGameState,
} from "../common/gameSlice.js";
import { PlanProps, random } from "../common/util.js";
import { PlayerInit, NoirServerSocket } from "../common/network.js";
import { Difficulty, MissionName, TutorialName } from "./Mission.js";
import CardInfoCache from "../common/CardInfoCache.js";
import LocalCardInfoCache from "./LocalCardInfoCache.js";
import { CardCosmetic } from "../common/card.js";
import { defaultDecks } from "../common/decks.js";
import { calculateTurn, defaultAIValues } from "./ai.js";

export default interface Player {
  id: string | null;
  name: string;
  trusted: boolean;
  init(): Promise<PlayerInit>;
  send(actions: GameAction[]): void;
  cosmetic(id: string, cosmetic: CardCosmetic): void;
  error(message: string): void;
  end(winner: Winner): void;
  turn(): Promise<PlanProps[]>;
}

export class SocketPlayer implements Player {
  actions: GameAction[] = [];
  cosmetics: [string, CardCosmetic][] = [];
  ai = null;
  trusted = false;

  constructor(
    public socket: NoirServerSocket,
    public player: PlayerId,
    public names: readonly [string, string],
    public id: string | null,
    public deck?: Deck
  ) {
    this.connect(socket);
  }

  get name() {
    return this.names[this.player];
  }

  connect(socket: NoirServerSocket) {
    this.socket = socket;

    this.socket.emit("init", this.player, this.names);
    this.socket.emit("actions", this.actions);

    for (const [id, cosmetic] of this.cosmetics) {
      this.socket.emit("cosmetic", id, cosmetic);
    }

    return this;
  }

  init(): Promise<PlayerInit> {
    return new Promise((resolve, reject) => {
      this.socket.once("init", (deck) => resolve({ deck: this.deck ?? deck }));
      this.socket.emit("init", this.player, this.names);
    });
  }

  send(actions: GameAction[]) {
    this.socket.emit("actions", actions);
    this.actions.push(...actions);
  }

  cosmetic(id: string, cosmetic: CardCosmetic): void {
    this.socket.emit("cosmetic", id, cosmetic);
    this.cosmetics.push([id, cosmetic]);
  }

  error(message: string): void {
    this.socket.emit("error", message);
  }

  end(winner: PlayerId): void {
    this.socket.emit("end", winner);
    this.socket.disconnect();
  }

  turn(): Promise<PlanProps[]> {
    return new Promise((resolve) => this.socket.once("turn", (action) => resolve(action)));
  }
}

export abstract class AIPlayer implements Player {
  state: GameState = initialGameState();
  timeout: boolean = true;
  cache: CardInfoCache = new LocalCardInfoCache();
  id = null;
  trusted = true;

  constructor(public player: PlayerId, public name: string) {

  }

  init(): Promise<PlayerInit> {
    return Promise.resolve({ deck: this.deck });
  }

  send(actions: GameAction[]): void {
    for (const action of actions) {
      this.state = gameSlice.reducer(this.state, action);
    }
  }

  cosmetic(): void {}

  turn(): Promise<PlanProps[]> {
    this.cache.reset();
    return Promise.resolve(calculateTurn(this.cache, this.state, this.player, defaultAIValues));
  }

  error(message: string) {
    console.error(message);
  }

  end() {}

  abstract deck: Deck;
}

export class TestPlayer extends AIPlayer {
  name = "Unit";

  deck = defaultDecks[random(["Green", "Blue", "Orange", "Purple"])] as Deck;
}

export abstract class SoloPlayer extends AIPlayer {
  constructor(
    public player: PlayerId,
    name: MissionName | TutorialName,
    public difficulty?: Difficulty
  ) {
    super(player, difficulty ? `${name} level ${difficulty}` : name);
  }

  abstract deck1: Deck;

  deck2: Deck | undefined;

  playerDeck?: Deck | undefined;

  get deck(): Deck {
    return this.deck2 && this.difficulty == 2 ? this.deck2 : this.deck1;
  }
}
