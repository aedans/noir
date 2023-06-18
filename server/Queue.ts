import Test from "./queue/Test";
import Casual from "./queue/Casual";
import { NoirServerSocket } from "../common/network";
import { Difficulty, MissionName } from "./Mission";
import Solo from "./queue/Solo";

export type QueueName = "test" | "casual" | `${MissionName} level ${Difficulty}`;

export const queues: { [T in QueueName]: Queue } = {
  test: new Test(),
  casual: new Casual(),
  "Random Citizens level 1": new Solo("Random Citizens", 1),
  "Random Citizens level 2": new Solo("Random Citizens", 2),
  "Daphril the Dauntless level 1": new Solo("Daphril the Dauntless", 1),
  "Daphril the Dauntless level 2": new Solo("Daphril the Dauntless", 2),
};

export default interface Queue {
  push(socket: NoirServerSocket, name: string): Promise<void>;
}
