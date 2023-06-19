import { PlayerId } from "../common/gameSlice";
import Player from "./Player";
import Daphril from "./solo/Daphril";
import IndustrialDesign from "./solo/IndustrialDesign";
import RandomCitizens from "./solo/RandomCitizens";
import StrengthInNumbers from "./solo/StrengthInNumbers";
import UnderhandedDealings from "./solo/UnderhandedDealings";

export type MissionName =
  | "Random Citizens"
  | "Daphril the Dauntless"
  | "Industrial Design"
  | "Strength in Numbers"
  | "Underhanded Dealings";

export type Difficulty = 1 | 2;

export const missions: { [T in MissionName]: (playerId: PlayerId, difficulty: Difficulty) => Player } = {
  "Random Citizens": (player, difficulty) => new RandomCitizens(player, difficulty),
  "Daphril the Dauntless": (player, difficulty) => new Daphril(player, difficulty),
  "Industrial Design": (player, difficulty) => new IndustrialDesign(player, difficulty),
  "Strength in Numbers": (player, difficulty) => new StrengthInNumbers(player, difficulty),
  "Underhanded Dealings": (player, difficulty) => new UnderhandedDealings(player, difficulty),
};
