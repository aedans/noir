import { gameSlice, GameState, Zone, zones } from "./gameSlice";

export function currentPlayer(game: { turn: number }) {
  return game.turn % 2 == 0 ? 0 as const : 1 as const;
}

export function cardOwner(game: GameState, card: { id: string }) {
  return findCard(game, card).player;
}

export function isInZone(game: GameState, card: { id: string }, zone: Zone) {
  return findCard(game, card).zone == zone;
}

export function findCard(game: GameState, card: { id: string }) {
  for (const player of [0, 1] as const) {
    for (const zone of zones) {
      const c = game.players[player][zone].find((c) => c.id == card.id);
      if (c) {
        return { player, zone };
      }
    }
  }

  throw new Error(`Card ${card.id} does not exist`);
}

const defaultUtil = {
  ...gameSlice.actions,
  cardOwner,
  isInZone,
}

export type Util = typeof defaultUtil;

export default defaultUtil;
