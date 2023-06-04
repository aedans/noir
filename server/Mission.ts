import { PlayerId } from "../common/gameSlice";
import Player from "./Player";
import Daphril from "./solo/Daphril";

export type MissionName = "daphril";

export const missions: { [T in MissionName]: (playerId: PlayerId) => Player } = {
  daphril: (playerId) => new Daphril(playerId),
}
