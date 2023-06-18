import { NoirServerSocket } from "../../common/network";
import { createGame } from "../game";
import { SocketPlayer, TestPlayer } from "../Player";
import Queue from "../Queue";

export default class Test implements Queue {
  async push(socket: NoirServerSocket, name: string): Promise<void> {
    await createGame([new SocketPlayer(socket, 0, [name, "Test"]), new TestPlayer(1, "Test")], () => {});
  }
}
