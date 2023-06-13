import { NoirServerSocket } from "../../common/network";
import { createGame } from "../game";
import { SocketPlayer, UnitPlayer } from "../Player";
import Queue from "../Queue";

export default class Test implements Queue {
  async push(socket: NoirServerSocket, name: string): Promise<void> {
    await createGame([new SocketPlayer(socket, 0, name), new UnitPlayer(1, "unit")], () => {});
  }
}
