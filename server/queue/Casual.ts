import { NoirServerSocket } from "../../common/network";
import { createGame } from "../game";
import { SocketPlayer } from "../Player";
import Queue from "../Queue";

export default class Casual implements Queue {
  sockets: NoirServerSocket[] = [];
  players: Map<string, SocketPlayer> = new Map();

  async push(socket: NoirServerSocket): Promise<void> {
    if (this.players.has(socket.data.user!)) {
      this.players.get(socket.data.user!)!.connect(socket);
      return;
    }

    socket.on("disconnect", () => {
      this.sockets = this.sockets.filter((s) => s != socket);
    });

    this.sockets.push(socket);

    if (this.sockets.length >= 2) {
      const [first, second] = this.sockets;
      this.sockets = this.sockets.slice(2);

      if (first.data.user == second.data.user) {
        first.data.user += " the First";
        second.data.user += " the Second";
      }

      this.players.set(first.data.user!, new SocketPlayer(first, 0));
      this.players.set(second.data.user!, new SocketPlayer(second, 1));

      await createGame([this.players.get(first.data.user!)!, this.players.get(second.data.user!)!], "casual", () => {
        this.players.delete(first.data.user!);
        this.players.delete(second.data.user!);
      });
    }
  }
}
