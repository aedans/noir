import { NoirServerSocket } from "../../common/network";
import Player, { SocketPlayer } from "../Player";
import Queue from "../Queue";
import { createGame } from "../game";
import { MissionName } from "../Mission";
import { PlayerId } from "../../common/gameSlice";
import { insertReplay } from "../db/replay";

export default class Solo implements Queue {
  constructor(public name: MissionName, public player: (playerId: PlayerId) => Player) {}

  async push(socket: NoirServerSocket, name: string): Promise<void> {
    await createGame([new SocketPlayer(socket, 0, name), this.player(1)], (winner, players, inits, state) => {
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
