import { NoirServerSocket } from "../../common/network";
import Player, { SocketPlayer } from "../Player";
import Queue from "../Queue";
import { createGame } from "../game";
import { Difficulty, MissionName, missions } from "../Mission";
import { insertReplay } from "../db/replay";

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
