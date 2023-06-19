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
  "Civic Proceedings level 1": new Solo("Civic Proceedings", 1),
  "Civic Proceedings level 2": new Solo("Civic Proceedings", 2),
  "Industrial Design level 1": new Solo("Industrial Design", 1),
  "Industrial Design level 2": new Solo("Industrial Design", 2),
  "Strength in Numbers level 1": new Solo("Strength in Numbers", 1),
  "Strength in Numbers level 2": new Solo("Strength in Numbers", 2),
  "Underhanded Dealings level 1": new Solo("Underhanded Dealings", 1),
  "Underhanded Dealings level 2": new Solo("Underhanded Dealings", 2),
};

export default interface Queue {
  push(socket: NoirServerSocket, name: string): Promise<void>;
}
