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
  players?: PlayerId[];
  zones?: Zone[];
  types?: CardType[];
};

export function filter(this: Util, game: GameState, filter: Filter) {
  let cards: CardState[] = [];

  for (const player of filter.players ?? ([0, 1] as const)) {
    for (const zone of filter.zones ?? zones) {
      let f = game.players[player][zone];

      if (filter.types) {
        f = f.filter((t) => filter.types!.includes(this.getCardInfo(game, t).type));
      }

      cards.push(...f);
    }
  }

  return cards;
}

export function cid() {
  return { id: uuid() };
}

export function random<T>(ts: T[]) {
  return ts[Math.floor(Math.random() * ts.length)];
}

export function randoms<T>(ts: T[], number: number) {
  const tss = [...ts];
  const result: T[] = [];
  for (let i = 0; i < number && tss.length > 0; i++) {
    result.push(tss.splice(Math.floor(Math.random() * tss.length), 1)[0]);
  }
  return result;
}

const util = {
  ...gameSlice.actions,
  opponent,
  currentPlayer,
  cardOwner,
  isInZone,
  filter,
  random,
  randoms,
  cid,
};

export type Util = typeof util & {
  getCardInfo: (game: GameState, card: CardState) => CardInfo;
};

export default util;
