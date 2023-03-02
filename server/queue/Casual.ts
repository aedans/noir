import { NoirServerSocket } from "../../common/network";
import { createGame } from "../game";
import { SocketPlayer } from "../Player";
import Queue from "../Queue";

export default class Casual implements Queue {
  sockets: NoirServerSocket[] = [];

  async push(socket: NoirServerSocket): Promise<void> {
    socket.on("disconnect", () => {
      this.sockets = this.sockets.filter(s => s != socket);
    });

    this.sockets.push(socket);

    if (this.sockets.length >= 2) {
      const [first, second] = this.sockets; 
      this.sockets = this.sockets.slice(2);
      await createGame([new SocketPlayer(first), new SocketPlayer(second)]);
    }
  }
}
