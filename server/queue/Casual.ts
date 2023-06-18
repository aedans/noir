import { NoirServerSocket } from "../../common/network";
import { insertReplay } from "../db/replay";
import { createGame } from "../game";
import { SocketPlayer } from "../Player";
import Queue from "../Queue";

export default class Casual implements Queue {
  queue: Map<string, NoirServerSocket> = new Map();
  games: Map<string, SocketPlayer> = new Map();

  async push(socket: NoirServerSocket, name: string): Promise<void> {
    if (this.games.has(name)) {
      this.games.get(name)!.connect(socket);
      return;
    }

    socket.on("disconnect", () => {
      this.queue.delete(name);
    });

    this.queue.set(name, socket);

    if (this.queue.size >= 2) {
      const [[firstName, first], [secondName, second]] = this.queue;
      const names = [firstName, secondName] as const;
      this.queue.delete(firstName);
      this.queue.delete(secondName);

      const players: [SocketPlayer, SocketPlayer] = [
        new SocketPlayer(first, 0, names),
        new SocketPlayer(second, 1, names),
      ];

      this.games.set(firstName, players[0]);
      this.games.set(secondName, players[1]);

      await createGame(players, (winner, players, inits, state) => {
        this.games.delete(firstName);
        this.games.delete(secondName);

        insertReplay({
          winner,
          queue: "casual",
          names: [players[0].name, players[1].name],
          inits,
          history: state.history,
        });
      });
    }
  }
}
