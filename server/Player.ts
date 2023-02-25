import { Socket } from "socket.io";
import { Target } from "../common/card";
import { Deck } from "../common/decksSlice";
import { PlayerId } from "../common/gameSlice";
import { HistoryAction } from "../common/historySlice";
import fs from "fs";
import { random } from "lodash";

const decks = JSON.parse(fs.readFileSync("./common/decks.json").toString());

export type PlayerInit = {
  deck: Deck;
};

export type PlayerAction = { type: "end" } | { type: "do"; id: string; target?: Target; prepared: Target[] };

export default interface Player {
  init(player: PlayerId): Promise<PlayerInit>;
  send(actions: HistoryAction[], name: string): void;
  error(message: string): void;
  end(winner: number): void;
  receive(): Promise<PlayerAction>;
}

export class SocketPlayer implements Player {
  socket: Socket;

  constructor(socket: Socket) {
    this.socket = socket;
  }

  init(player: PlayerId): Promise<PlayerInit> {
    return new Promise((resolve, reject) => {
      this.socket.once("init", (action) => resolve(action));
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
    return Promise.resolve({ deck: Object.values(decks)[random(0, 3, false)] as Deck });
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
