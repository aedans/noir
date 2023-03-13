import { Deck } from "../common/decksSlice";
import { PlayerId } from "../common/gameSlice";
import { HistoryAction } from "../common/historySlice";
import fs from "fs";
import { random } from "../common/util";
import { PlayerInit, PlayerAction, NoirServerSocket } from "../common/network";

const decks = JSON.parse(fs.readFileSync("./common/decks.json").toString());

export default interface Player {
  init(): Promise<PlayerInit>;
  send(actions: HistoryAction[], name: string): void;
  error(message: string): void;
  end(winner: number): void;
  onAction(callback: (action: PlayerAction | "concede") => void): void;
}

export class SocketPlayer implements Player {
  socket: NoirServerSocket;
  callbacks: ((action: PlayerAction | "concede") => void)[] = [];
  actions: HistoryAction[] = [];
  player: PlayerId;

  constructor(socket: NoirServerSocket, player: PlayerId) {
    this.socket = socket;
    this.player = player;
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

export class UnitPlayer implements Player {
  callbacks: ((action: PlayerAction) => void)[] = [];

  init(): Promise<PlayerInit> {
    return Promise.resolve({ deck: decks[random(["Green", "Blue", "Orange", "Purple"])] as Deck });
  }

  send() {
    setTimeout(() => {
      for (const callback of this.callbacks) {
        callback({ type: "end" });
      }
    }, 100);
  }

  error() {}

  end() {}

  onAction(callback: (action: PlayerAction) => void): void {
    this.callbacks.push(callback);
  }
}
