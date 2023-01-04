import { Socket } from "socket.io";
import Test from "./queue/Test";
import Casual from "./queue/Casual";

export const queues: { [name: string]: Queue } = {
  test: new Test(),
  casual: new Casual(),
};

export default interface Queue {
  push(socket: Socket): void;
}
