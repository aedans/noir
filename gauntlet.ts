import { PlayerId, Winner } from "./common/gameSlice.js";
import { MissionName, missions } from "./server/Mission.js";
import Player from "./server/Player.js";
import { createGame } from "./server/game.js";
import { Worker, isMainThread, parentPort } from "worker_threads";

function createPlayer(name: MissionName, player: PlayerId) {
  const result = missions[name as MissionName](player, name == "Random Citizens" ? 2 : 1);
  result.timeout = false;
  return result;
}

function runGame(names: [MissionName, MissionName]): Promise<Winner> {
  return new Promise((resolve) => {
    const worker = new Worker("./gauntlet.js");
    worker.postMessage(names);
    worker.on("message", (winner: Winner) => {
      resolve(winner);
      worker.terminate();
    });
  });
}

if (!isMainThread) {
  parentPort?.on("message", (names: [MissionName, MissionName]) => {
    const players: [Player, Player] = [createPlayer(names[0], 0), createPlayer(names[1], 1)];
    createGame(players, (winner) => parentPort?.postMessage(winner));
  });
}

if (isMainThread) {
  const names = Object.keys(missions).filter((name) => name != "Random") as MissionName[];

  async function results() {
    const records: {
      [name: string]: {
        wins: number;
        losses: number;
        draws: number;
      };
    } = {};

    const promises: Promise<any>[] = [];

    for (const name1 of names) {
      for (const name2 of names) {
        for (let i = 0; i < 1; i++) {
          if (name1 == name2) {
            continue;
          }

          promises.push(
            runGame([name1, name2]).then((winner) => {
              const verbs: { [key in Winner]: string } = {
                [0]: "wins",
                [1]: "loses",
                draw: "draws",
              };

              console.log(`${name1} ${verbs[winner]} against ${name2}`);

              for (const name of [name1, name2]) {
                if (!(name in records)) {
                  records[name] = { wins: 0, losses: 0, draws: 0 };
                }
              }

              if (winner == 0) {
                records[name1].wins++;
                records[name2].losses++;
              }

              if (winner == 1) {
                records[name1].losses++;
                records[name2].wins++;
              }

              if (winner == "draw") {
                records[name1].draws++;
                records[name2].draws++;
              }
            })
          );
        }
      }
    }

    await Promise.all(promises);

    console.log();

    for (const [name, record] of Object.entries(records)) {
      console.log(name, record);
    }
  }

  await results();
}
