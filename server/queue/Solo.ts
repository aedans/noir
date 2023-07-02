import { NoirServerSocket } from "../../common/network.js";
import { SocketPlayer } from "../Player.js";
import Queue from "../Queue.js";
import { createGame } from "../game.js";
import { Difficulty, MissionName, missions } from "../Mission.js";
import { insertReplay } from "../db/replay.js";

export default class Solo implements Queue {
  games: Map<string, SocketPlayer> = new Map();

  constructor(public name: MissionName, public difficulty: Difficulty) {}

  async push(socket: NoirServerSocket, name: string): Promise<void> {
    if (this.games.has(name)) {
      this.games.get(name)!.connect(socket);
      return;
    }

    const mission = missions[this.name](1, this.difficulty);
    const player = new SocketPlayer(socket, 0, [name, mission.name]);
    this.games.set(name, player);

    await createGame([player, mission], (winner, players, inits, state) => {
      this.games.delete(name);
      insertReplay({
        winner,
        queue: "solo",
        names: [players[0].name, players[1].name],
        inits,
        history: state.history,
      });
    });
  }
}
