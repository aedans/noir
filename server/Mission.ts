import { PlayerId } from "../common/gameSlice";
import Player from "./Player";
import Daphril from "./solo/Daphril";

export type MissionName = "daphril";
export type Difficulty = 1 | 2 | 3;

export const missions: { [T in MissionName]: (playerId: PlayerId, difficulty: Difficulty) => Player } = {
  daphril: (playerId, difficulty) => new Daphril(playerId, "Daphril the Dauntless", difficulty),
}
