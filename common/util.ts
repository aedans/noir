import { CardColor, CardCost, CardInfo, CardKeyword, CardModifier, CardState, CardType, Target } from "./card";
import { findCard, gameSlice, GameState, getCard, PlayerId, Zone, zones } from "./gameSlice";
import { v4 as uuid } from "uuid";

export function opponent(player: PlayerId) {
  return player == 0 ? 1 : 0;
}

export function currentPlayer(game: { turn: number }) {
  return game.turn % 2 == 0 ? (0 as const) : (1 as const);
}

export type Filter = {
  players?: PlayerId[];
  zones?: Zone[];
  types?: CardType[];
  colors?: CardColor[];
};

export function filter(this: Util, game: GameState, filter: Filter) {
  let cards: CardState[] = [];

  for (const player of filter.players ?? ([0, 1] as const)) {
    for (const zone of filter.zones ?? zones) {
      let f = game.players[player][zone];

      if (filter.types && filter.types.length > 0) {
        f = f.filter((card) => filter.types!.includes(this.getCardInfo(game, card).type));
      }

      if (filter.colors && filter.colors.length > 0) {
        f = f.filter((card) => this.getCardInfo(game, card).colors.some((color) => filter.colors!.includes(color)));
      }

      cards.push(...f);
    }
  }

  return cards;
}

export function canPayCost(this: Util, game: GameState, player: PlayerId, colors: CardColor[], cost: CardCost) {
  const agents = this.filter(game, {
    players: [player],
    types: ["agent"],
    zones: ["board"],
    colors,
  });

  return game.players[player].money >= cost.money && agents.length >= cost.agents;
}

export function updateCardInfo(this: Util, game: GameState, state: CardState, info: CardInfo) {
  for (const modifier of state.modifiers) {
    const card = getCard(game, modifier.card);
    if (card) {
      const modifiers = this.getCardInfo(game, card, true).modifiers ?? {};
      info = { ...info, ...modifiers[modifier.name](info, modifier) };
    }
  }

  for (const card of this.filter(game, { zones: ["board"] })) {
    info = { ...info, ...this.getCardInfo(game, card, true).effect(info, state) };
  }

  return info;
}

export function keywordModifier(keyword: CardKeyword): CardModifier {
  return (info) => ({
    keywords: [...info.keywords, keyword],
  });
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
  findCard: findCard as (game: GameState, card: Target) => { player: PlayerId; zone: Zone; index: number },
  opponent,
  currentPlayer,
  filter,
  canPayCost,
  updateCardInfo,
  keywordModifier,
  cid,
  random,
  randoms,
};

export type Util = typeof util & {
  getCardInfo: (game: GameState, card: CardState, base?: boolean) => CardInfo;
};

export default util;
