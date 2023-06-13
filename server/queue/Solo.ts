import { NoirServerSocket } from "../../common/network";
import Player, { SocketPlayer } from "../Player";
import Queue from "../Queue";
import { createGame } from "../game";
import { MissionName } from "../Mission";
import { PlayerId } from "../../common/gameSlice";
import { insertReplay } from "../db/replay";

export default class Solo implements Queue {
  games: Map<string, SocketPlayer> = new Map();

  constructor(public name: MissionName, public player: (playerId: PlayerId) => Player) {}

  async push(socket: NoirServerSocket, name: string): Promise<void> {
    if (this.games.has(name)) {
      this.games.get(name)!.connect(socket);
      return;
    }

    const player = new SocketPlayer(socket, 0, name);
    this.games.set(name, player);

    await createGame([player, this.player(1)], (winner, players, inits, state) => {
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
