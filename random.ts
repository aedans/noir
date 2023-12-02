import { Winner } from "./common/gameSlice.js";
import { createGame } from "./server/game.js";
import Random from "./server/solo/Random.js";
import { isMainThread, Worker, parentPort } from "worker_threads";

if (!isMainThread) {
  parentPort?.on('message', () => {
    const players: [Random, Random] = [new Random(0, 1), new Random(1, 1)];
    players[0].timeout = false;
    players[1].timeout = false;
  
    createGame(players, (winner) => {
      parentPort?.postMessage(winner)
    });  
  })
} else {
  async function runSet(number: number) {
    console.log(`Round ${number + 1}`);
    const promises: Promise<void>[] = [];

    for (let i = 0; i < 16; i++) {
      promises.push(new Promise((resolve) => {
        const worker = new Worker("./random.js");
        worker.postMessage(undefined);
        worker.on("message", (winner: Winner) => {
          console.log(`Game ${i} winner: ${winner}`)
          worker.terminate();
          resolve();
        });
      }));
    }

    await Promise.all(promises);
  }
  
  for (let i = 0;; i++) {
    await runSet(i);
  }
}
