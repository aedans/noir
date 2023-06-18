import Test from "./queue/Test";
import Casual from "./queue/Casual";
import { NoirServerSocket } from "../common/network";
import { Difficulty, MissionName, missions } from "./Mission";
import Solo from "./queue/Solo";

export type QueueName = "test" | "casual" | `${MissionName}${Difficulty}`;

export const queues: { [T in QueueName]: Queue } = {
  test: new Test(),
  casual: new Casual(),
  randomCitizens1: new Solo("randomCitizens", (id) => missions.randomCitizens(id, 1)),
  randomCitizens2: new Solo("randomCitizens", (id) => missions.randomCitizens(id, 2)),
  daphril1: new Solo("daphril", (id) => missions.daphril(id, 1)),
  daphril2: new Solo("daphril", (id) => missions.daphril(id, 2)),
};

export default interface Queue {
  push(socket: NoirServerSocket, name: string): Promise<void>;
}
