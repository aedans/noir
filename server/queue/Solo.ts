import { NoirServerSocket } from "../../common/network";
import Player, { SocketPlayer } from "../Player";
import Queue from "../Queue";
import { createGame } from "../game";
import { MissionName } from "../Mission";
import { PlayerId } from "../../common/gameSlice";

export default class Solo implements Queue {
  constructor(public name: MissionName, public player: (playerId: PlayerId) => Player) {}

  async push(socket: NoirServerSocket): Promise<void> {
    await createGame([new SocketPlayer(socket, 0), this.player(1)], this.name, () => {});
  }
}
