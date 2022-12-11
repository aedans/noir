import { Socket } from "socket.io";
import Practice from "./queue/Practice";
import Unranked from "./queue/Unranked";

export const queues: { [name: string]: Queue } = {
  practice: new Practice(),
  unranked: new Unranked(),
};

export default interface Queue {
  push(socket: Socket): void;
}
