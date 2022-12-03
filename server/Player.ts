import { AnyAction } from "redux";
import { Socket } from "socket.io";
import { Deck } from "../common/decksSlice";

export type PlayerInit = {
  deck: Deck;
};

export type PlayerAction = { type: "end" } | { type: "play"; id: string } | { type: "use"; id: string };

export default interface Player {
  init(): Promise<PlayerInit>;
  send(action: AnyAction): void;
  receive(): Promise<PlayerAction>;
}

export class SocketPlayer implements Player {
  socket: Socket;

  constructor(socket: Socket) {
    this.socket = socket;
  }

  init(): Promise<PlayerInit> {
    return new Promise((resolve, reject) => {
      this.socket.once("init", (action) => resolve(action));
    });
  }

  send(action: AnyAction) {
    this.socket.emit("action", action);
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
