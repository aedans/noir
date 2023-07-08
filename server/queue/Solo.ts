import { NoirServerSocket } from "../../common/network.js";
import { SocketPlayer } from "../Player.js";
import Queue from "../Queue.js";
import { createGame } from "../game.js";
import { Difficulty, MissionName, missions } from "../Mission.js";
import { replayCollection } from "../db.js";

export default class Solo implements Queue {
  games: Map<string, SocketPlayer> = new Map();

  constructor(public name: MissionName, public difficulty: Difficulty) {}

  async push(socket: NoirServerSocket, name: string, id: string): Promise<void> {
    if (id != null && this.games.has(id)) {
      this.games.get(id)!.connect(socket);
      return;
    }

    const mission = missions[this.name](1, this.difficulty);
    const player = new SocketPlayer(socket, 0, [name, mission.name], id);

    if (id != null) {
      this.games.set(id, player);
    }

    await createGame([player, mission], async (winner, players, inits, state, isValid) => {
      if (id != null) {
        this.games.delete(id);
      }

      if (!isValid) {
        return;
      }
      
      const replays = await replayCollection();
      replays.insertOne({
        timestamp: new Date(),
        winner,
        queue: "solo",
        ids: [players[0].id, players[1].id],
        names: [players[0].name, players[1].name],
        inits,
        history: state.history,
      });
    });
  }
}
