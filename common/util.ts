import {
  CardColor,
  CardCost,
  CardGenerator,
  CardInfo,
  CardKeyword,
  CardModifier,
  CardState,
  CardTrigger,
  CardType,
  Target,
} from "./card";
import {
  addCard,
  AddCardParams,
  addMoney,
  bounceCard,
  endTurn,
  enterCard,
  exhaustCard,
  findCard,
  GameAction,
  GameParams,
  GameState,
  getCard,
  PlayerId,
  protectCard,
  removeCard,
  refreshCard,
  removeMoney,
  revealCard,
  setProp,
  TargetCardParams,
  Zone,
  zones,
} from "./gameSlice";
import { v4 as uuid } from "uuid";
import { historySlice } from "./historySlice";

export function opponentOf(player: PlayerId) {
  return player == 0 ? 1 : 0;
}

export function currentPlayer(game: { turn: number }) {
  return game.turn % 2 == 0 ? (0 as const) : (1 as const);
}

export function opponent(game: GameState, card: Target) {
  return opponentOf(findCard(game, card)?.player ?? currentPlayer(game));
}

export type Filter = {
  players?: PlayerId[];
  zones?: Zone[];
  excludes?: Target[];
  types?: CardType[];
  colors?: CardColor[];
  hidden?: boolean;
  exhausted?: boolean;
};

export function filter(this: Util, game: GameState, filter: Filter) {
  let cards: CardState[] = [];

  for (const player of filter.players ?? ([0, 1] as const)) {
    for (const zone of filter.zones ?? zones) {
      let f = game.players[player][zone];

      if (filter.types != undefined && filter.types.length > 0) {
        f = f.filter((card) => filter.types!.includes(this.getCardInfo(game, card).type));
      }

      if (filter.colors != undefined && filter.colors.length > 0) {
        f = f.filter((card) => this.getCardInfo(game, card).colors.some((color) => filter.colors!.includes(color)));
      }

      if (filter.excludes != undefined && filter.excludes.length > 0) {
        f = f.filter((card) => filter.excludes!.every((c) => c.id != card.id));
      }

      if (filter.hidden != undefined) {
        f = f.filter((card) => filter.hidden! == card.hidden);
      }

      if (filter.exhausted != undefined) {
        f = f.filter((card) => filter.exhausted! == card.exhausted);
      }

      cards.push(...f);
    }
  }

  return cards;
}

export function tryPayCost(
  this: Util,
  game: GameState,
  card: Target,
  verb: string,
  name: string,
  player: PlayerId,
  colors: CardColor[],
  cost: CardCost
): string | { agents: CardState[]; money: number } {
  if (game.players[player].money < cost.money) {
    return `Not enough money to ${verb} ${name}`;
  }

  const agents = this.filter(game, {
    players: [player],
    types: ["agent"],
    zones: ["board"],
    excludes: [card],
    exhausted: false,
    colors,
  });

  if (agents.length < cost.agents) {
    return `Not enough agents to ${verb} ${name}`;
  }

  agents.sort((a, b) => this.getCardInfo(game, b).activationPriority - this.getCardInfo(game, a).activationPriority);

  return {
    agents: agents.slice(0, cost.agents),
    money: cost.money,
  };
}

export function canPayCost(
  this: Util,
  game: GameState,
  card: CardState,
  player: PlayerId,
  colors: CardColor[],
  cost: CardCost
) {
  return typeof this.tryPayCost(game, card, "play", card.name, player, colors, cost) != "string";
}

export function* revealRandom(
  this: Util,
  game: GameState,
  card: CardState,
  number: number,
  filter: Omit<Filter, "hidden">
): CardGenerator {
  const cards = this.filter(game, {
    ...filter,
    hidden: true,
    excludes: [card, ...(filter.excludes ?? [])],
  });

  for (const card of util.randoms(cards, number)) {
    yield* this.revealCard(game, { card });
  }
}

export function updateCardInfo(this: Util, game: GameState, state: CardState, info: CardInfo) {
  if (!findCard(game, state)) {
    return info;
  }

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

export function onTrigger<T extends GameParams>(
  trigger: (payload: T) => GameAction,
  selector?: (info: CardInfo, game: GameState, payload: T) => CardTrigger<T>,
  init: boolean = false
) {
  return function* (this: GetCardInfo, game: GameState, payload: T): CardGenerator {
    const newGame = yield trigger(payload);
    if (init) {
      game = newGame;
    }

    if (selector && payload.card) {
      const card = getCard(game, payload.card);
      if (card) {
        yield* selector(this.getCardInfo(game, card), game, payload)(payload);
      }
    }
  };
}

function* onAdd(info: CardInfo, payload: AddCardParams): CardGenerator {
  yield* info.onAdd(payload);

  if (info.keywords.includes("protected")) {
    yield protectCard(payload);
  }
}

function* onRemove(info: CardInfo, game: GameState, payload: TargetCardParams): CardGenerator {
  const state = getCard(game, payload.card);

  if (state && !state.protected) {
    yield* info.onRemove(payload);
  }
}

const util = {
  ...historySlice.actions,
  endTurn: onTrigger(endTurn),
  addCard: onTrigger(addCard, (info) => (payload) => onAdd(info, payload), true),
  removeCard: onTrigger(removeCard, (info, game) => (payload) => onRemove(info, game, payload)),
  enterCard: onTrigger(enterCard, (info) => info.onEnter),
  bounceCard: onTrigger(bounceCard, (info) => info.onBounce),
  revealCard: onTrigger(revealCard, (info) => info.onReveal),
  refreshCard: onTrigger(refreshCard, (info) => info.onRefresh),
  exhaustCard: onTrigger(exhaustCard, (info) => info.onExhaust),
  setProp: onTrigger(setProp, (info) => info.onSetProp),
  addMoney: onTrigger(addMoney),
  removeMoney: onTrigger(removeMoney),
  findCard: findCard as (game: GameState, card: Target) => { player: PlayerId; zone: Zone; index: number },
  getCard: getCard as (game: GameState, card: Target) => CardState,
  opponentOf,
  currentPlayer,
  opponent,
  filter,
  tryPayCost,
  canPayCost,
  revealRandom,
  updateCardInfo,
  keywordModifier,
  cid,
  random,
  randoms,
};

export type GetCardInfo = { getCardInfo: (game: GameState, card: CardState, base?: boolean) => CardInfo };
export type Util = typeof util & GetCardInfo;

export default util;
