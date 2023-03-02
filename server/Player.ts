import { Deck } from "../common/decksSlice";
import { PlayerId } from "../common/gameSlice";
import { HistoryAction } from "../common/historySlice";
import fs from "fs";
import { random } from "../common/util";
import { PlayerInit, PlayerAction, NoirServerSocket } from "../common/network";

const decks = JSON.parse(fs.readFileSync("./common/decks.json").toString());

export default interface Player {
  init(player: PlayerId): Promise<PlayerInit>;
  send(actions: HistoryAction[], name: string): void;
  error(message: string): void;
  end(winner: number): void;
  receive(): Promise<PlayerAction>;
}

export class SocketPlayer implements Player {
  socket: NoirServerSocket;

  constructor(socket: NoirServerSocket) {
    this.socket = socket;
  }

  init(player: PlayerId): Promise<PlayerInit> {
    return new Promise((resolve, reject) => {
      this.socket.once("init", (deck) => resolve({ deck }));
      this.socket.emit("init", player);
    });
  }

  send(actions: HistoryAction[], name: string) {
    this.socket.emit("actions", actions, name);
  }

  error(message: string): void {
    this.socket.emit("error", message);
  }

  end(winner: number): void {
    this.socket.emit("end", winner);
  }

  receive(): Promise<PlayerAction> {
    return new Promise((resolve, reject) => {
      this.socket.once("action", (action) => resolve(action));
    });
  }
}

export class UnitPlayer implements Player {
  init(): Promise<PlayerInit> {
    return Promise.resolve({ deck: decks[random(["Green", "Blue", "Orange", "Purple"])] as Deck });
  }

  send() {}

  error() {}

  end() {}

  receive(): Promise<PlayerAction> {
    return new Promise((resolve, reject) => {
      setTimeout(() => resolve({ type: "end" }), 100);
    });
  }
}
