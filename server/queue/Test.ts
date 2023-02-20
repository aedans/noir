import { Socket } from "socket.io";
import { createGame } from "../game";
import { SocketPlayer, UnitPlayer } from "../Player";
import Queue from "../Queue";

export default class Test implements Queue {
  async push(socket: Socket): Promise<void> {
    await createGame([new SocketPlayer(socket), new UnitPlayer()]);
  }
}
