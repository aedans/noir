import { setAutoFreeze } from "immer";
import { PlayerId, Winner } from "./common/gameSlice.js";
import { MissionName, missions } from "./server/Mission.js";
import Player from "./server/Player.js";
import { createGame } from "./server/game.js";

setAutoFreeze(false);

const ais: ((player: PlayerId) => Player)[] = Object.keys(missions).map((name) => (player) => {
  const result = missions[name as MissionName](player, name == "Random Citizens" ? 2 : 1);
  result.timeout = false;
  return result;
});

async function results() {
  const records: {
    [name: string]: {
      wins: number;
      losses: number;
      draws: number;
    };
  } = {};

  for (const ai1 of ais) {
    for (const ai2 of ais) {
      for (let i = 0; i < 1; i++) {
        const players: [Player, Player] = [ai1(0), ai2(1)];

        if (players[0].id == players[1].id) {
          continue;
        }

        const winner: Winner = await new Promise((resolve) => createGame(players, (winner) => resolve(winner)));
        const verbs: { [key in Winner]: string } = {
          [0]: "wins",
          [1]: "loses",
          draw: "draws",
        };

        console.log(`${players[0].id} ${verbs[winner]} against ${players[1].id}`);

        for (const player of players) {
          if (!(player.name in records)) {
            records[player.name] = { wins: 0, losses: 0, draws: 0 };
          }
        }

        if (winner == 0) {
          records[players[0].name].wins++;
          records[players[1].name].losses++;
        }

        if (winner == 1) {
          records[players[0].name].losses++;
          records[players[1].name].wins++;
        }

        if (winner == "draw") {
          records[players[0].name].draws++;
          records[players[1].name].draws++;
        }
      }
    }
  }

  console.log();

  for (const [name, record] of Object.entries(records)) {
    console.log(name, record);
  }
}

results();