import { Socket } from "socket.io";
import { createGame } from "../game";
import { SocketPlayer } from "../Player";
import Queue from "../Queue";

export default class Casual implements Queue {
  sockets: Socket[] = [];

  async push(socket: Socket): Promise<void> {
    this.sockets.push(socket);

    if (this.sockets.length >= 2) {
      await createGame([new SocketPlayer(this.sockets[0]), new SocketPlayer(this.sockets[1])]);
      this.sockets = this.sockets.slice(2);
    }
  }
}
