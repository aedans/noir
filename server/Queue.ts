import Test from "./queue/Test";
import Casual from "./queue/Casual";
import { NoirServerSocket } from "../common/network";

export const queues: { [name: string]: Queue } = {
  test: new Test(),
  casual: new Casual(),
};

export default interface Queue {
  push(socket: NoirServerSocket): Promise<void>;
}
