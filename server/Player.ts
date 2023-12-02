import { Deck } from "../common/decks.js";
import { PlayerId, Winner, currentPlayer } from "../common/gameSlice.js";
import { HistoryAction, batch, historySlice } from "../common/historySlice.js";
import { random } from "../common/util.js";
import { PlayerInit, PlayerAction, NoirServerSocket } from "../common/network.js";
import { HistoryState } from "../common/historySlice.js";
import { initialHistoryState } from "../common/historySlice.js";
import { Difficulty, MissionName } from "./Mission.js";
import CardInfoCache from "../common/CardInfoCache.js";
import LocalCardInfoCache from "./LocalCardInfoCache.js";
import { CardCosmetic } from "../common/card.js";
import { defaultDecks } from "../common/decks.js";
import AI, { AISettings } from "./AI.js";

export default interface Player {
  id: string | null;
  name: string;
  ai: AI | null;
  init(): Promise<PlayerInit>;
  send(actions: HistoryAction[], name: string): void;
  cosmetic(id: string, cosmetic: CardCosmetic): void;
  error(message: string): void;
  end(winner: Winner): void;
  onAction(callback: (action: PlayerAction | "concede") => void): void;
}

export class SocketPlayer implements Player {
  callbacks: ((action: PlayerAction | "concede") => void)[] = [];
  actions: HistoryAction[] = [];
  cosmetics: [string, CardCosmetic][] = [];
  ai = null;

  constructor(
    public socket: NoirServerSocket,
    public player: PlayerId,
    public names: readonly [string, string],
    public id: string | null
  ) {
    this.connect(socket);
  }

  get name() {
    return this.names[this.player];
  }

  connect(socket: NoirServerSocket) {
    this.socket = socket;

    this.socket.on("action", (action) => {
      for (const callback of this.callbacks) {
        callback(action);
      }
    });

    this.socket.on("concede", () => {
      for (const callback of this.callbacks) {
        callback("concede");
      }
    });

    this.socket.emit("init", this.player, this.names);
    this.socket.emit("actions", this.actions, `player${this.player}/load`);

    for (const [id, cosmetic] of this.cosmetics) {
      this.socket.emit("cosmetic", id, cosmetic);
    }

    return this;
  }

  init(): Promise<PlayerInit> {
    return new Promise((resolve, reject) => {
      this.socket.once("init", (deck) => resolve({ deck }));
      this.socket.emit("init", this.player, this.names);
    });
  }

  send(actions: HistoryAction[], name: string) {
    this.socket.emit("actions", actions, name);
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

  onAction(callback: (action: PlayerAction | "concede") => void) {
    this.callbacks.push(callback);
  }
}

export abstract class AIPlayer implements Player {
  callbacks: ((action: PlayerAction) => void)[] = [];
  history: HistoryState = initialHistoryState();
  invalid: PlayerAction[] = [];
  valid: PlayerAction[] = [];
  timeout: boolean = true;
  cache: CardInfoCache = new LocalCardInfoCache();
  id = null;
  ai: AI;

  constructor(public player: PlayerId, public name: string, public settings: Partial<AISettings>,) {
    this.ai = new AI(settings);
  }

  init(): Promise<PlayerInit> {
    return Promise.resolve({ deck: this.deck });
  }

  send(actions: HistoryAction[]): void {
    this.history = historySlice.reducer(this.history, batch({ actions }));

    this.invalid = [];
    this.valid = [];

    this.doAction();
  }

  cosmetic(): void {}

  doAction() {
    const current = currentPlayer(this.history.current);
    if (current == this.player) {
      this.cache.reset();
      const action = this.ai.bestAction(this.history.current, this.cache, this.invalid);

      this.valid.push(action);

      if (this.timeout) {
        setTimeout(() => {
          for (const callback of this.callbacks) {
            callback(action);
          }
        }, 1000);
      } else {
        for (const callback of this.callbacks) {
          callback(action);
        }
      }
    }
  }

  onAction(callback: (action: PlayerAction) => void): void {
    this.callbacks.push(callback);
    this.doAction();
  }

  error() {
    this.invalid.push(...this.valid);
    this.valid = [];
    this.doAction();
  }

  end() {}

  abstract deck: Deck;
}

export class TestPlayer extends AIPlayer {
  name = "Unit";

  deck = defaultDecks[random(["Green", "Blue", "Orange", "Purple"])] as Deck;
}

export abstract class MissionPlayer extends AIPlayer {
  constructor(public player: PlayerId, name: MissionName, public difficulty: Difficulty, settings: Partial<AISettings>) {
    super(player, `${name} level ${difficulty}`, settings);
  }

  abstract deck1: Deck;

  abstract deck2: Deck;

  get deck(): Deck {
    return this.difficulty == 1 ? this.deck1 : this.deck2;
  }
}
