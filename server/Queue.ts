import Test from "./queue/Test";
import Casual from "./queue/Casual";
import { NoirServerSocket } from "../common/network";
import { MissionName, missions } from "./Mission";
import Solo from "./queue/Solo";

export type QueueName = "test" | "casual" | MissionName;

export const queues: { [T in QueueName]: Queue } = {
  test: new Test(),
  casual: new Casual(),
  daphril: new Solo("daphril", missions.daphril),
};

export default interface Queue {
  push(socket: NoirServerSocket): Promise<void>;
}
