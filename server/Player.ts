import { AnyAction } from "redux";
import { Socket } from "socket.io";

export type PlayerAction = { type: "end" } | { type: "play"; id: string } | { type: "use"; id: string };

export default interface Player {
  send(action: AnyAction): void;
  receive(): Promise<PlayerAction>;
}

export class SocketPlayer implements Player {
  socket: Socket;

  constructor(socket: Socket) {
    this.socket = socket;
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
  send() {}

  receive(): Promise<PlayerAction> {
    return Promise.resolve({ type: "end" });
  }
}
