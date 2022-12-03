import { findCard, gameSlice, GameState, Zone } from "./gameSlice";

export function currentPlayer(game: { turn: number }) {
  return game.turn % 2 == 0 ? (0 as const) : (1 as const);
}

export function cardOwner(game: GameState, card: { id: string }) {
  return findCard(game, card)!.player;
}

export function isInZone(game: GameState, card: { id: string }, zone: Zone) {
  return findCard(game, card)?.zone == zone;
}

const defaultUtil = {
  ...gameSlice.actions,
  cardOwner,
  isInZone,
};

export type Util = typeof defaultUtil;

export default defaultUtil;
