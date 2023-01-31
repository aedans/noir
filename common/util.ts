import {
  CardColor,
  CardCost,
  CardGenerator,
  CardInfo,
  CardKeyword,
  cardKeywords,
  CardModifier,
  CardState,
  CardTrigger,
  CardType,
  PartialCardInfoComputation,
  runPartialCardInfoComputation,
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
  stealCard,
  opponentOf,
  currentPlayer,
  opponent,
  self,
  modifyCard,
  playCard,
  PlayCardParams,
} from "./gameSlice";
import { v4 as uuid } from "uuid";
import { historySlice, SetUndoneParams } from "./historySlice";

export type Filter = {
  excludes?: Target[];
  players?: PlayerId[];
  zones?: Zone[];
  types?: CardType[];
  colors?: CardColor[];
  hidden?: boolean;
  exhausted?: boolean;
  maxMoney?: number;
  minMoney?: number;
  ordering?: Order[];
  reversed?: boolean;
} & { [key in CardKeyword]?: boolean };

export function filter(this: Util, cache: CardInfoCache, game: GameState, filter: Filter) {
  let cards: CardState[] = [];

  for (const player of filter.players ?? ([0, 1] as const)) {
    for (const zone of filter.zones ?? zones) {
      let f = game.players[player][zone];

      if (filter.excludes != undefined && filter.excludes.length > 0) {
        f = f.filter((card) => filter.excludes!.every((c) => c.id != card.id));
      }

      if (filter.types != undefined && filter.types.length > 0) {
        f = f.filter((card) => filter.types!.includes(this.getCardInfo(cache, game, card).type));
      }

      if (filter.colors != undefined && filter.colors.length > 0) {
        f = f.filter((card) => this.getCardInfo(cache, game, card).colors.some((c) => filter.colors!.includes(c)));
      }

      if (filter.hidden != undefined) {
        f = f.filter((card) => filter.hidden! == card.hidden);
      }

      if (filter.exhausted != undefined) {
        f = f.filter((card) => filter.exhausted! == card.exhausted);
      }

      if (filter.maxMoney != undefined) {
        f = f.filter((card) => this.getCardInfo(cache, game, card).cost.money <= filter.maxMoney!);
      }

      if (filter.minMoney != undefined) {
        f = f.filter((card) => this.getCardInfo(cache, game, card).cost.money >= filter.minMoney!);
      }

      for (const keyword of cardKeywords) {
        if (filter[keyword] != undefined) {
          f = f.filter((card) => this.getCardInfo(cache, game, card).keywords.includes(keyword) == filter[keyword]!);
        }
      }

      cards.push(...f);
    }
  }

  if (filter.ordering != undefined) {
    cards = ordered(cards, filter.ordering, (card) => this.getCardInfo(cache, game, card));
  }

  if (filter.reversed != undefined && filter.reversed) {
    cards = cards.reverse();
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

export function getTargets(this: Util, cache: CardInfoCache, game: GameState, card: Target, targetFilter: Filter) {
  const opponent = this.opponent(game, card);
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
    return this.filter(cache, game, {
      ...targetFilter,
      vip: false,
    });
  }
}

export function tryPayCost(
  this: Util,
  cache: CardInfoCache,
  game: GameState,
  card: Target,
  verb: string,
  name: string,
  player: PlayerId,
  colors: CardColor[],
  cost: CardCost,
  targets: Filter | undefined
): string | { agents: CardState[]; money: number } {
  if (game.players[player].money < cost.money) {
    return `Not enough money to ${verb} ${name}`;
  }

  const agents = this.filter(cache, game, {
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

  if (targets != undefined && this.getTargets(cache, game, card, targets).length == 0) {
    return `No valid targets for ${name}`;
  }

  agents.sort((a, b) => this.getCardInfo(cache, game, b).activationPriority - this.getCardInfo(cache, game, a).activationPriority);

  return {
    agents: agents.slice(0, cost.agents),
    money: cost.money,
  };
}

export function canPayCost(
  this: Util,
  cache: CardInfoCache,
  game: GameState,
  card: CardState,
  player: PlayerId,
  colors: CardColor[],
  cost: CardCost,
  targets: Filter | undefined
) {
  return typeof this.tryPayCost(cache, game, card, "play", card.name, player, colors, cost, targets) != "string";
}

export function* revealRandom(
  this: Util,
  cache: CardInfoCache,
  game: GameState,
  card: CardState,
  number: number,
  filter: Omit<Filter, "hidden">
): CardGenerator {
  const cards = this.filter(cache, game, {
    ...filter,
    hidden: true,
    excludes: [card, ...(filter.excludes ?? [])],
  });

  for (const target of util.randoms(cards, number)) {
    yield* this.revealCard(cache, game, card, { target });
  }
}

export type CardInfoCache = Map<string, CardInfo>;

export function getCardInfo(this: Util, cache: CardInfoCache, game: GameState, card: CardState): CardInfo {
  if (cache.has(card.id)) {
    return cache.get(card.id)!;
  } else {
    cache.set(card.id, runPartialCardInfoComputation(() => ({}), this, cache, game, card));
    const baseInfo = runPartialCardInfoComputation(this.getCardInfoImpl(card), this, cache, game, card);
    cache.set(card.id, baseInfo);
    const info = this.updateCardInfo(cache, game, card, baseInfo);
    cache.set(card.id, info);
    return info;
  }
}

export function updateCardInfo(
  this: Util,
  cache: CardInfoCache,
  game: GameState,
  state: CardState,
  info: CardInfo,
) {
  if (!findCard(game, state)) {
    return info;
  }

  cache.set(state.id, info);

  for (const modifier of state.modifiers) {
    const card = getCard(game, modifier.card);
    if (card) {
      const modifiers = this.getCardInfo(cache, game, card).modifiers ?? {};
      info = { ...info, ...modifiers[modifier.name](info, modifier) };
      cache.set(state.id, info);
    }
  }

  for (const card of this.filter(cache, game, { zones: ["board"] })) {
    const cardInfo = this.getCardInfo(cache, game, card);
    if (this.filter(cache, game, cardInfo.effectFilter).find((c) => c.id == state.id)) {
      info = { ...info, ...cardInfo.effect(info, state) };
      cache.set(state.id, info);
    }

    if (this.filter(cache, game, cardInfo.secondaryEffectFilter).find((c) => c.id == state.id)) {
      info = { ...info, ...cardInfo.secondaryEffect(info, state) };
      cache.set(state.id, info);
    }
  }

  cache.set(state.id, info);

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
  selector?: (info: CardInfo, game: GameState) => CardTrigger<T>,
  init: boolean = false
) {
  return function* (
    this: GetCardInfo,
    cache: CardInfoCache,
    game: GameState,
    source: Target | null,
    sourceless: Omit<T, "source">
  ): CardGenerator {
    const payload = { ...sourceless, source } as T;
    const newGame = yield trigger(payload);
    if (init) {
      game = newGame;
    }

    if (selector && sourceless.target) {
      const card = getCard(game, sourceless.target);
      if (card) {
        yield* selector(this.getCardInfo(cache, game, card), game)(payload);
      }
    }
  };
}

function triggerReveal<T extends GameParams>(
  info: CardInfo,
  game: GameState,
  trigger?: CardTrigger<T>,
  ...[selectTarget]: T extends TargetCardParams ? [undefined?] : [(payload: T) => PlayerId]
): CardTrigger<T> {
  return function* (payload) {
    if (trigger) {
      yield* trigger(payload);
    }

    if (payload.source) {
      const sourcePlayer = findCard(game, payload.source)?.player;
      const targetPlayer = selectTarget
        ? (selectTarget as (payload: T) => PlayerId)(payload)
        : findCard(game, payload.target!)?.player;

      if (sourcePlayer != targetPlayer) {
        const reveal: TargetCardParams = { source: payload.source, target: payload.source };
        yield revealCard(reveal);
        yield* info.onReveal(reveal);
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

function* onPlay(info: CardInfo, payload: PlayCardParams): CardGenerator {
  yield* info.onPlay(payload);

  if (payload.type == "operation") {
    yield* info.onRemove(payload);
  } else {
    yield* info.onEnter(payload);
  }
}

function* onRemove(info: CardInfo, game: GameState, payload: TargetCardParams): CardGenerator {
  const state = getCard(game, payload.target);

  if (state && !state.protected) {
    yield* info.onRemove(payload);
  }
}

function setUndone(game: GameState, payload: SetUndoneParams) {
  return historySlice.actions.setUndone({ index: game.history.length - payload.index - 1 });
}

const util = {
  endTurn: onTrigger(endTurn),
  addCard: onTrigger(addCard, (info, game) => triggerReveal(info, game, (p) => onAdd(info, p)), true),
  playCard: onTrigger(playCard, (info, game) => triggerReveal(info, game, (p) => onPlay(info, p))),
  removeCard: onTrigger(removeCard, (info, game) => triggerReveal(info, game, (p) => onRemove(info, game, p))),
  enterCard: onTrigger(enterCard, (info, game) => triggerReveal(info, game, info.onEnter)),
  bounceCard: onTrigger(bounceCard, (info, game) => triggerReveal(info, game, info.onBounce)),
  stealCard: onTrigger(stealCard, (info, game) => triggerReveal(info, game, info.onSteal)),
  revealCard: onTrigger(revealCard, (info, game) => triggerReveal(info, game, info.onReveal)),
  refreshCard: onTrigger(refreshCard, (info, game) => triggerReveal(info, game, info.onRefresh)),
  exhaustCard: onTrigger(exhaustCard, (info, game) => triggerReveal(info, game, info.onExhaust)),
  setProp: onTrigger(setProp, (info, game) => triggerReveal(info, game, info.onSetProp)),
  modifyCard: onTrigger(modifyCard, (info, game) => triggerReveal(info, game, info.onModify)),
  addMoney: onTrigger(addMoney, (info, game) => triggerReveal(info, game, undefined, (p) => p.player)),
  removeMoney: onTrigger(removeMoney, (info, game) => triggerReveal(info, game, undefined, (p) => p.player)),
  findCard: findCard as (game: GameState, card: Target) => { player: PlayerId; zone: Zone; index: number },
  getCard: getCard as (game: GameState, card: Target) => CardState,
  setUndone,
  opponentOf,
  currentPlayer,
  self,
  opponent,
  filter,
  ordered,
  getTargets,
  tryPayCost,
  canPayCost,
  revealRandom,
  updateCardInfo,
  getCardInfo,
  keywordModifier,
  cid,
  random,
  randoms,
};

export type GetCardInfo = {
  getCardInfo: (cache: CardInfoCache, game: GameState, card: CardState) => CardInfo;
  getCardInfoImpl: (card: { name: string }) => PartialCardInfoComputation;
};

export type Util = typeof util & GetCardInfo;

export default util;
