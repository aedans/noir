import { CardInfo, CardState, CardType, Target } from "./card";
import { findCard, gameSlice, GameState, PlayerId, Zone, zones } from "./gameSlice";
import { v4 as uuid } from "uuid";

export function opponent(player: PlayerId) {
  return player == 0 ? 1 : 0;
}

export function currentPlayer(game: { turn: number }) {
  return game.turn % 2 == 0 ? (0 as const) : (1 as const);
}

export function cardOwner(game: GameState, card: Target) {
  return findCard(game, card)!.player;
}

export function isInZone(game: GameState, card: Target, zone: Zone) {
  return findCard(game, card)?.zone == zone;
}

export type Filter = {
  players?: PlayerId[],
  zones?: Zone[],
  types?: CardType[],
}

export function filter(this: Util, game: GameState, filter: Filter) {
  let cards: CardState[] = [];

  for (const player of filter.players ?? [0, 1] as const) {
    for (const zone of filter.zones ?? zones) {
      let f = game.players[player][zone];

      if (filter.types) {
        f = f.filter(t => filter.types!.includes(this.getCardInfo(game, t).type));
      }

      cards.push(...f);
    }
  }

  return cards;
}

const util = {
  ...gameSlice.actions,
  uuid,
  opponent,
  currentPlayer,
  cardOwner,
  isInZone,
  filter,
};

export type Util = typeof util & {
  getCardInfo: (game: GameState, card: CardState) => CardInfo,
};

export default util;
