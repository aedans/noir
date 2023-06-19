import { PlayerId } from "../common/gameSlice";
import Player from "./Player";
import Daphril from "./solo/Daphril";
import RandomCitizens from "./solo/RandomCitizens";
import StrengthInNumbers from "./solo/StrengthInNumbers";

export type MissionName = "Random Citizens" | "Daphril the Dauntless" | "Strength in Numbers";
export type Difficulty = 1 | 2;

export const missions: { [T in MissionName]: (playerId: PlayerId, difficulty: Difficulty) => Player } = {
  "Random Citizens": (player, difficulty) => new RandomCitizens(player, difficulty),
  "Daphril the Dauntless": (player, difficulty) => new Daphril(player, difficulty),
  "Strength in Numbers": (player, difficulty) => new StrengthInNumbers(player, difficulty),
};
