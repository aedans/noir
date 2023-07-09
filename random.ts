import { createGame } from "./server/game.js";
import Random from "./server/solo/Random.js";

for (let i = 0; i < 100; i++) {
  const players: [Random, Random] = [new Random(0, 1), new Random(1, 1)];
  players[0].timeout = false;
  players[1].timeout = false;

  createGame(players, (winnner) => {
    console.log(`Game ${i}: ${winnner}`);
  });
}
