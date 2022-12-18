import { Socket } from "socket.io";
import { Target } from "../common/card";
import { Deck } from "../common/decksSlice";
import { PlayerId } from "../common/gameSlice";
import { HistoryAction } from "../common/historySlice";

export type PlayerInit = {
  deck: Deck;
};

export type PlayerAction = { type: "end" } | { type: "do"; id: string; target?: Target };

export default interface Player {
  init(player: PlayerId): Promise<PlayerInit>;
  send(actions: HistoryAction[], name: string): void;
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

  receive(): Promise<PlayerAction> {
    return new Promise((resolve, reject) => {
      this.socket.once("action", (action) => resolve(action));
    });
  }
}

export class UnitPlayer implements Player {
  init(): Promise<PlayerInit> {
    return Promise.resolve({ deck: { cards: [] } });
  }

  send() {}

  receive(): Promise<PlayerAction> {
    return new Promise((resolve, reject) => {
      setTimeout(() => resolve({ type: "end" }), 1000);
    });
  }
}
