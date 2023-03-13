import Test from "./queue/Test";
import Casual from "./queue/Casual";
import { NoirServerSocket } from "../common/network";

export type QueueName = "test" | "casual";

export const queues: { [T in QueueName]: Queue } = {
  test: new Test(),
  casual: new Casual(),
};

export default interface Queue {
  push(socket: NoirServerSocket): Promise<void>;
}
