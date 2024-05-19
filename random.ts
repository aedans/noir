import { createGame } from "./server/game.js";
import Random from "./server/solo/Random.js";
import { isMainThread, Worker, parentPort } from "worker_threads";

if (process.argv.includes("--sync")) {
  let index = 0;
  (async () => {
    while (true) {
      try {
        const players: [Random, Random] = [new Random(0, 1), new Random(1, 1)];
        players[0].timeout = false;
        players[1].timeout = false;
  
        await createGame(players, (winner) => {
          console.log(`Game ${index++} winner: ${winner}`);
        });
      } catch (e) {
        throw e;
      }
    }  
  })()
} else if (!isMainThread) {
  parentPort?.on("message", async (index: string) => {
    const players: [Random, Random] = [new Random(0, 1), new Random(1, 1)];
    players[0].timeout = false;
    players[1].timeout = false;

    await createGame(players, (winner) => {
      parentPort?.postMessage({ index, winner });
    });
  });
} else {
  let index = 0;
  for (let i = 0; i < 16; i++) {
    new Promise(async () => {
      while (true) {
        const worker = new Worker("./random.js");
        worker.postMessage(index++);
        await new Promise((resolve) => {
          worker.on("message", (res) => {
            console.log(`Game ${res.index} winner: ${res.winner}`);
            resolve(undefined);
          });
        });
      }
    });
  }
}
