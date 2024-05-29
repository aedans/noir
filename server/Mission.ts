import { PlayerId } from "../common/gameSlice.js";
import { SoloPlayer } from "./Player.js";
import CivicProceedings from "./solo/CivicProceedings.js";
import Daphril from "./solo/Daphril.js";
import IndustrialDesign from "./solo/IndustrialDesign.js";
import Random from "./solo/Random.js";
import RandomCitizens from "./solo/RandomCitizens.js";
import StrengthInNumbers from "./solo/StrengthInNumbers.js";
import UnderhandedDealings from "./solo/UnderhandedDealings.js";
import Tutorial1 from "./solo/Tutorial.js";

export type MissionName =
  | "Random"
  | "Random Citizens"
  | "Daphril the Dauntless"
  | "Civic Proceedings"
  | "Industrial Design"
  | "Strength in Numbers"
  | "Underhanded Dealings";

export type TutorialName = "Tutorial";

export type Difficulty = 1 | 2;

export const missions: {
  [T in MissionName | TutorialName]: (playerId: PlayerId, difficulty: Difficulty) => SoloPlayer;
} = {
  Tutorial: (player) => new Tutorial1(player),
  Random: (player, difficulty) => new Random(player, difficulty),
  "Random Citizens": (player, difficulty) => new RandomCitizens(player, difficulty),
  "Daphril the Dauntless": (player, difficulty) => new Daphril(player, difficulty),
  "Civic Proceedings": (player, difficulty) => new CivicProceedings(player, difficulty),
  "Industrial Design": (player, difficulty) => new IndustrialDesign(player, difficulty),
  "Strength in Numbers": (player, difficulty) => new StrengthInNumbers(player, difficulty),
  "Underhanded Dealings": (player, difficulty) => new UnderhandedDealings(player, difficulty),
};
