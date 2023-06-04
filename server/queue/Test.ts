import { NoirServerSocket } from "../../common/network";
import { createGame } from "../game";
import { SocketPlayer, UnitPlayer } from "../Player";
import Queue from "../Queue";

export default class Test implements Queue {
  async push(socket: NoirServerSocket): Promise<void> {
    await createGame([new SocketPlayer(socket, 0), new UnitPlayer(1)], "test", () => {});
  }
}
