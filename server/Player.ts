import { Deck } from "../common/decksSlice";
import { PlayerId, currentPlayer } from "../common/gameSlice";
import { HistoryAction, historySlice } from "../common/historySlice";
import fs from "fs";
import { random } from "../common/util";
import { PlayerInit, PlayerAction, NoirServerSocket } from "../common/network";
import { HistoryState } from "../common/historySlice";
import { initialHistoryState } from "../common/historySlice";
import { Goal, GoalState, runGoals } from "./Goal";

const decks = JSON.parse(fs.readFileSync("./common/decks.json").toString());

export default interface Player {
  name: string;
  init(): Promise<PlayerInit>;
  send(actions: HistoryAction[], name: string): void;
  error(message: string): void;
  end(winner: number): void;
  onAction(callback: (action: PlayerAction | "concede") => void): void;
}

export class SocketPlayer implements Player {
  callbacks: ((action: PlayerAction | "concede") => void)[] = [];
  actions: HistoryAction[] = [];

  constructor(public socket: NoirServerSocket, public player: PlayerId, public name: string) {
    this.connect(socket);
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

    this.socket.emit("init", this.player);
    this.socket.emit("actions", this.actions, `player${this.player}/load`);

    return this;
  }

  init(): Promise<PlayerInit> {
    return new Promise((resolve, reject) => {
      this.socket.once("init", (deck) => resolve({ deck }));
      this.socket.emit("init", this.player);
    });
  }

  send(actions: HistoryAction[], name: string) {
    this.socket.emit("actions", actions, name);
    this.actions.push(...actions);
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

export abstract class ComputerPlayer implements Player {
  callbacks: ((action: PlayerAction) => void)[] = [];
  history: HistoryState = initialHistoryState();
  state: GoalState = { lastPlay: {} };

  constructor(public player: PlayerId, public name: string) {}

  init(): Promise<PlayerInit> {
    return Promise.resolve({ deck: this.deck });
  }

  async send(history: HistoryAction[]): Promise<void> {
    for (const action of history) {
      this.history = historySlice.reducer(this.history, action);
    }

    let action = runGoals(this.history.current, this.player, this.goals, this.state);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (action == null) {
      action = { type: "end" };
    }

    for (const callback of this.callbacks) {
      callback(action);
    }
  }

  onAction(callback: (action: PlayerAction) => void): void {
    this.callbacks.push(callback);
  }

  error() {}

  end() {}

  abstract deck: Deck;

  abstract goals: Goal[];
}

export class UnitPlayer extends ComputerPlayer {
  name = "unit";

  deck = decks[random(["Green", "Blue", "Orange", "Purple"])] as Deck;

  goals = [];
}
