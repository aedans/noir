import { PlayerId } from "../common/gameSlice.js";
import { MissionPlayer } from "./Player.js";
import CivicProceedings from "./solo/CivicProceedings.js";
import Daphril from "./solo/Daphril.js";
import IndustrialDesign from "./solo/IndustrialDesign.js";
import RandomCitizens from "./solo/RandomCitizens.js";
import StrengthInNumbers from "./solo/StrengthInNumbers.js";
import UnderhandedDealings from "./solo/UnderhandedDealings.js";

export type MissionName =
  | "Random Citizens"
  | "Daphril the Dauntless"
  | "Civic Proceedings"
  | "Industrial Design"
  | "Strength in Numbers"
  | "Underhanded Dealings";

export type Difficulty = 1 | 2;

export const missions: { [T in MissionName]: (playerId: PlayerId, difficulty: Difficulty) => MissionPlayer } = {
  "Random Citizens": (player, difficulty) => new RandomCitizens(player, difficulty),
  "Daphril the Dauntless": (player, difficulty) => new Daphril(player, difficulty),
  "Civic Proceedings": (player, difficulty) => new CivicProceedings(player, difficulty),
  "Industrial Design": (player, difficulty) => new IndustrialDesign(player, difficulty),
  "Strength in Numbers": (player, difficulty) => new StrengthInNumbers(player, difficulty),
  "Underhanded Dealings": (player, difficulty) => new UnderhandedDealings(player, difficulty),
};
