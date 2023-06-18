import { PlayerId } from "../common/gameSlice";
import Player from "./Player";
import Daphril from "./solo/Daphril";
import RandomCitizens from "./solo/RandomCitizens";

export type MissionName = "Random Citizens" | "Daphril the Dauntless";
export type Difficulty = 1 | 2;

export const missions: { [T in MissionName]: (playerId: PlayerId, difficulty: Difficulty) => Player } = {
  "Random Citizens": (player, difficulty) => new RandomCitizens(player, difficulty),
  "Daphril the Dauntless": (player, difficulty) => new Daphril(player, difficulty),
};
