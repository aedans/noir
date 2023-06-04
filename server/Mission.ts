import { PlayerId } from "../common/gameSlice";
import Player from "./Player";
import Dapril from "./solo/Daphril";

export type MissionName = "daphril";

export const missions: { [T in MissionName]: (playerId: PlayerId) => Player } = {
  daphril: (playerId) => new Dapril(playerId),
}
