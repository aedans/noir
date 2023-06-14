import Test from "./queue/Test";
import Casual from "./queue/Casual";
import { NoirServerSocket } from "../common/network";
import { Difficulty, MissionName, missions } from "./Mission";
import Solo from "./queue/Solo";

export type QueueName = "test" | "casual" | `${MissionName}${Difficulty}`;

export const queues: { [T in QueueName]: Queue } = {
  test: new Test(),
  casual: new Casual(),
  daphril1: new Solo("daphril", (id) => missions.daphril(id, 1)),
  daphril2: new Solo("daphril", (id) => missions.daphril(id, 2)),
  daphril3: new Solo("daphril", (id) => missions.daphril(id, 3)),
};

export default interface Queue {
  push(socket: NoirServerSocket, name: string): Promise<void>;
}
