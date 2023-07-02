import { NoirServerSocket } from "../../common/network.js";
import { createGame } from "../game.js";
import { SocketPlayer, TestPlayer } from "../Player.js";
import Queue from "../Queue.js";

export default class Test implements Queue {
  async push(socket: NoirServerSocket, name: string, id: string): Promise<void> {
    await createGame([new SocketPlayer(socket, 0, [name, "Test"], id), new TestPlayer(1, "Test")], () => {});
  }
}
