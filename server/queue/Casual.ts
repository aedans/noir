import { NoirServerSocket } from "../../common/network.js";
import { User, replayCollection, userCollection } from "../db.js";
import { createGame } from "../game.js";
import { SocketPlayer } from "../Player.js";
import Queue from "../Queue.js";
import { getCosmetic, getTop } from "../cosmetics.js";

export default class Casual implements Queue {
  queue: Map<string, NoirServerSocket> = new Map();
  names: Map<string, string> = new Map();
  games: Map<string, SocketPlayer> = new Map();

  async push(socket: NoirServerSocket, name: string, id: string | null): Promise<void> {
    if (id == null) {
      throw "Must be logged in to play against other players";
    }

    if (this.games.has(id)) {
      this.games.get(id)!.connect(socket);
      return;
    }

    socket.on("disconnect", () => {
      this.queue.delete(id);
      this.names.delete(id);
    });

    this.queue.set(id, socket);
    this.names.set(id, name);

    if (this.queue.size >= 2) {
      const [[id1, first], [id2, second]] = this.queue;
      const names = [this.names.get(id1)!, this.names.get(id2)!] as const;
      this.queue.delete(id1);
      this.queue.delete(id2);
      this.names.delete(id1);
      this.names.delete(id2);

      const players: [SocketPlayer, SocketPlayer] = [
        new SocketPlayer(first, 0, names, id1),
        new SocketPlayer(second, 1, names, id2),
      ];

      this.games.set(id1, players[0]);
      this.games.set(id2, players[1]);

      await createGame(players, async (winner, players, inits, state, isValid) => {
        this.games.delete(id1);
        this.games.delete(id2);

        if (!isValid) {
          return;
        }

        const replays = await replayCollection();
        replays.insertOne({
          timestamp: new Date(),
          winner,
          queue: "casual",
          ids: [players[0].id, players[1].id],
          names: [players[0].name, players[1].name],
          inits,
          history: state.history,
        });

        if (winner != "draw") {
          const player = players[winner];
          if (player.id == null) {
            return;
          }

          const users = await userCollection();
          const user: User = (await users.findOne({ _id: player.id })) ?? { _id: player.id, experience: {} };

          for (const card of Object.keys(inits[winner].deck.cards)) {
            if (!user.experience[card]) {
              user.experience[card] = 0;
            }

            user.experience[card]++;

            getTop.remove([card]);
            getCosmetic.remove([user._id, card]);
          }

          users.replaceOne({ _id: player.id }, user, { upsert: true });
        }
      });
    }
  }
}
