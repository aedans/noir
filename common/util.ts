import { nanoid } from "nanoid/non-secure";
import { CardColor, CardCost, CardGenerator, CardInfo, CardModifier, CardState, CardType, Target } from "./card.js";
import {
  addCard,
  addMoney,
  bounceCard,
  enterCard,
  exhaustCard,
  findCard,
  GameState,
  getCard,
  PlayerId,
  removeCard,
  refreshCard,
  removeMoney,
  revealCard,
  setProp,
  Zone,
  zones,
  stealCard,
  opponentOf,
  opponent,
  self,
  modifyCard,
  activateCard,
  defaultCardState,
} from "./gameSlice.js";
import CardInfoCache from "./CardInfoCache.js";
import { Deck } from "../common/decks.js";
import { CardKeyword, cardKeywords } from "./keywords.js";
import { PlayerAction } from "./network.js";
import { bestTarget } from "../server/ai.js";

export type Filter = {
  excludes?: Target[];
  includes?: Target[];
  players?: PlayerId[];
  zones?: Zone[];
  names?: string[];
  hidden?: boolean;
  exhausted?: boolean;
  types?: CardType[];
  colors?: CardColor[];
  maxMoney?: number;
  minMoney?: number;
  maxAgents?: number;
  minAgents?: number;
  random?: boolean;
  ordering?: Order[];
  reversed?: boolean;
  number?: number;
  text?: string;
  hasActivate?: boolean;
} & { [key in CardKeyword[0]]?: boolean };

export function filter(this: Util, cache: CardInfoCache, game: GameState, filter: Filter) {
  let cards: CardState[] = [];

  for (const player of filter.players ?? ([0, 1] as const)) {
    for (const zone of filter.zones ?? zones) {
      let f = game.players[player][zone];

      if (filter.names != undefined && filter.names.length > 0) {
        f = f.filter((card) => filter.names!.includes(card.name));
      }

      if (filter.excludes != undefined && filter.excludes.length > 0) {
        f = f.filter((card) => filter.excludes!.every((c) => c.id != card.id));
      }

      if (filter.includes != undefined && filter.includes.length > 0) {
        f = f.filter((card) => filter.includes!.some((c) => c.id == card.id));
      }

      if (filter.hidden != undefined) {
        f = f.filter((card) => filter.hidden! == card.hidden);
      }

      if (filter.exhausted != undefined) {
        f = f.filter((card) => filter.exhausted! == card.exhausted);
      }

      if (filter.types != undefined && filter.types.length > 0) {
        f = f.filter((card) => filter.types!.includes(cache.getCardInfo(game, card).type));
      }

      if (filter.colors != undefined && filter.colors.length > 0) {
        f = f.filter((card) => cache.getCardInfo(game, card).colors.some((c) => filter.colors!.includes(c)));
      }

      if (filter.maxMoney != undefined) {
        f = f.filter((card) => cache.getCardInfo(game, card).cost.money <= filter.maxMoney!);
      }

      if (filter.minMoney != undefined) {
        f = f.filter((card) => cache.getCardInfo(game, card).cost.money >= filter.minMoney!);
      }

      if (filter.maxAgents != undefined) {
        f = f.filter((card) => cache.getCardInfo(game, card).cost.agents <= filter.maxAgents!);
      }

      if (filter.minAgents != undefined) {
        f = f.filter((card) => cache.getCardInfo(game, card).cost.agents >= filter.minAgents!);
      }

      if (filter.text != undefined) {
        f = f.filter(
          (card) =>
            cache.getCardInfo(game, card).text.toLowerCase().includes(filter.text!.toLowerCase()) ||
            cache.getCardInfo(game, card).keywords.some((k) => k[0].includes(filter.text!.toLowerCase()))
        );
      }

      if (filter.hasActivate != undefined) {
        f = f.filter((card) => cache.getCardInfo(game, card).hasActivate == filter.hasActivate!);
      }

      for (const name of Object.keys(cardKeywords)) {
        if (filter[name] != undefined) {
          f = f.filter((card) => cache.getCardInfo(game, card).keywords.some((k) => k[0] == name) == filter[name]!);
        }
      }

      cards.push(...f);
    }
  }

  if (filter.random != undefined && filter.random) {
    cards = randoms(cards, cards.length);
  }

  if (filter.ordering != undefined) {
    cards = ordered(cards, filter.ordering, (card) => cache.getCardInfo(game, card));
  }

  if (filter.reversed != undefined && filter.reversed) {
    cards = cards.reverse();
  }

  if (filter.number != undefined) {
    cards = cards.slice(0, filter.number);
  }

  return cards;
}

export type Order = "money" | "agents" | "color";

export const orderings: { [T in Order]: (card: CardInfo) => number } = {
  money: (card: CardInfo) => card.cost.money,
  agents: (card: CardInfo) => card.cost.agents,
  color: (card: CardInfo) => card.colors.map((color) => color.charCodeAt(0)).reduce((a, b) => a + b, 0),
};

export function ordered<T>(array: T[], ordering: Order[], map: (t: T) => CardInfo) {
  return [...array].sort((a, b) => {
    for (const order of ordering) {
      const f = orderings[order];
      const res = f(map(a)) - f(map(b));
      if (res != 0) {
        return res;
      }
    }

    return 0;
  });
}

export type DeckValidationResult = {
  errors: string[];
  actualSize: number;
  expectedSize: number;
};

export function validateDeck(cache: CardInfoCache, deck: Deck): DeckValidationResult {
  const errors = [] as string[];
  let actualSize = 0;
  let expectedSize = 20;

  for (const [name, count] of Object.entries(deck.cards)) {
    const state = defaultCardState(name, `${name} ${count}`);
    const info = cache.getDefaultCardInfo(state);
    errors.push(...info.validateDeck(deck, state));
    actualSize += count;
    expectedSize += info.modifyDeckSize(deck);
  }

  if (actualSize > expectedSize) {
    errors.push(`Deck cannot have more than ${expectedSize} cards`);
  }

  return { errors, actualSize, expectedSize };
}

export function getTargets(this: Util, cache: CardInfoCache, game: GameState, card: Target, targetFilter: Filter) {
  const opponent = this.opponent(game, card)!;

  const bodyguards = this.filter(cache, game, {
    players: [opponent],
    zones: ["board"],
    types: ["agent"],
    disloyal: false,
    vip: false,
  });

  if (bodyguards.length == 0) {
    return this.filter(cache, game, targetFilter);
  } else {
    return [
      ...this.filter(cache, game, {
        ...targetFilter,
        vip: false,
      }),
      ...this.filter(cache, game, {
        ...targetFilter,
        vip: true,
        players: [this.opponentOf(opponent)],
      }),
    ];
  }
}

export type PlanProps = { type: "play" | "activate"; action: PlayerAction; card: CardState };

export function planResources(
  cache: CardInfoCache,
  game: GameState,
  player: PlayerId,
  plan: Pick<PlanProps, "type" | "card">[]
) {
  let moneyCost = 0;
  let agentsCost: Filter[] = [];

  for (const action of plan) {
    const info = cache.getCardInfo(game, action.card);
    const cost = action.type == "play" ? info.cost : info.activateCost;
    moneyCost += cost.money;

    for (let i = 0; i < cost.agents; i++) {
      agentsCost.push({ colors: info.colors });
    }

    if (action.type == "activate") {
      agentsCost.unshift({ includes: [action.card] });
    }
  }

  if (moneyCost > game.players[player].money) {
    return "not enough money";
  }

  let possibleAgents: CardState[][] = [[]];

  while (agentsCost.length > 0) {
    const cost = agentsCost.shift()!;

    possibleAgents = possibleAgents.flatMap((possibility) => {
      return util
        .filter(cache, game, {
          players: [player],
          types: ["agent"],
          zones: ["board"],
          exhausted: false,
          excludes: possibility,
          ...cost,
        })
        .map((agent) => [...possibility, agent]);
    });
  }

  if (possibleAgents.length == 0) {
    return "not enough agents";
  }

  return {
    money: game.players[player].money - moneyCost,
    moneyCost,
    possibleAgents,
  };
}

export function canPayPlan(
  cache: CardInfoCache,
  game: GameState,
  player: PlayerId,
  plan: Pick<PlanProps, "type" | "card">[],
  pay: Pick<PlanProps, "type" | "card">
) {
  return typeof planResources(cache, game, player, [...plan, pay]) != "string";
}

export function* revealRandom(
  this: Util,
  cache: CardInfoCache,
  game: GameState,
  card: CardState,
  number: number,
  filter: Omit<Filter, "players" | "hidden" | "number"> = {}
): CardGenerator<CardState[]> {
  const opponent = util.opponent(game, card)!;
  const cards: CardState[] = [];

  for (const zone of ["board", "deck", "grave"] as const) {
    if (cards.length < number && (!filter.zones || filter.zones.includes(zone))) {
      cards.push(
        ...this.filter(cache, game, {
          zones: [zone],
          players: [opponent],
          hidden: true,
          random: true,
          number: number - cards.length,
          ...filter,
        })
      );
    }
  }

  for (const target of cards) {
    yield revealCard({ source: card, target });
  }

  return cards;
}

export function keywordModifier(keyword: CardKeyword): CardModifier {
  return (info) => ({
    keywords: [...info.keywords, keyword],
  });
}

export function cid() {
  return { id: nanoid() };
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

export function isEqual<T>(a: T, b: T) {
  return JSON.stringify(a) == JSON.stringify(b);
}

export function isRevealed(game: GameState, id: string) {
  return game.history.some((action) => action.type == "game/revealCard" && action.payload.target?.id == id);
}

const util = {
  addCard,
  activateCard,
  removeCard,
  enterCard,
  bounceCard,
  stealCard,
  revealCard,
  refreshCard,
  exhaustCard,
  setProp,
  modifyCard,
  addMoney,
  removeMoney,
  defaultCardState,
  findCard: findCard as (game: GameState, card: Target) => { player: PlayerId; zone: Zone; index: number },
  getCard: getCard as (game: GameState, card: Target) => CardState,
  opponentOf,
  opponent: (game: GameState, card: Target) => opponent(game, card)!,
  self: (game: GameState, card: Target) => self(game, card)!,
  filter,
  ordered,
  getTargets,
  revealRandom,
  keywordModifier,
  cid,
  random,
  randoms,
  isRevealed,
  bestTarget
};

export type Util = typeof util;

export default util;
