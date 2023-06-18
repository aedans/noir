import { PlayerId } from "../common/gameSlice";
import Player, { ComputerPlayer } from "./Player";
import Daphril from "./solo/Daphril";
import RandomCitizens from "./solo/RandomCitizens";

export type MissionName = "randomCitizens" | "daphril";
export type Difficulty = 1 | 2;

export const missions: { [T in MissionName]: (playerId: PlayerId, difficulty: Difficulty) => Player } = {
  randomCitizens: (player, difficulty) => new RandomCitizens(player, difficulty),
  daphril: (player, difficulty) => new Daphril(player, difficulty),
};
