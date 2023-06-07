import { nanoid } from "nanoid/non-secure";
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
  initialGameState,
  noop,
  NoActionParams,
} from "./gameSlice";
import { historySlice, SetUndoneParams } from "./historySlice";
import { remove, shuffle } from "lodash";
import { defaultUtil } from "../client/cards";

export type Filter = {
  excludes?: Target[];
  players?: PlayerId[];
  zones?: Zone[];
  names?: string[];
  types?: CardType[];
  colors?: CardColor[];
  hidden?: boolean;
  exhausted?: boolean;
  playable?: boolean;
  activatable?: boolean;
  maxMoney?: number;
  minMoney?: number;
  random?: boolean;
  ordering?: Order[];
  reversed?: boolean;
  number?: number;
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

      if (filter.playable != undefined && filter.playable) {
        f = f.filter((card) => {
          const info = this.getCardInfo(cache, game, card);
          return this.canPayCost(cache, game, card, player, info.colors, info.cost, info.targets, []);
        });
      }

      if (filter.activatable != undefined && filter.activatable) {
        f = f.filter((card) => {
          const info = this.getCardInfo(cache, game, card);
          return (
            !card.exhausted &&
            info.hasActivate &&
            this.canPayCost(cache, game, card, player, info.colors, info.activateCost, info.activateTargets, [])
          );
        });
      }

      if (filter.maxMoney != undefined) {
        f = f.filter((card) => this.getCardInfo(cache, game, card).cost.money <= filter.maxMoney!);
      }

      if (filter.minMoney != undefined) {
        f = f.filter((card) => this.getCardInfo(cache, game, card).cost.money >= filter.minMoney!);
      }

      for (const keyword of cardKeywords) {
        var name = keyword()[0];
        if (filter[name] != undefined) {
          f = f.filter(
            (card) => this.getCardInfo(cache, game, card).keywords.some((k) => k[0] == name) == filter[name]!
          );
        }
      }

      cards.push(...f);
    }
  }

  if (filter.random != undefined && filter.random) {
    cards = shuffle(cards);
  }

  if (filter.ordering != undefined) {
    cards = ordered(cards, filter.ordering, (card) => this.getCardInfo(cache, game, card));
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
  targets: Filter | undefined,
  prepared: Target[]
): string | { agents: CardState[]; money: number } {
  if (cost.money > 0 && game.players[player].money < cost.money) {
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

  agents.sort((a, b) => {
    if (prepared.some((card) => card.id == a.id)) {
      return -1;
    } else if (prepared.some((card) => card.id == b.id)) {
      return 1;
    } else {
      return this.getCardInfo(cache, game, b).activationPriority - this.getCardInfo(cache, game, a).activationPriority;
    }
  });

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
  targets: Filter | undefined,
  prepared: Target[]
) {
  return (
    typeof this.tryPayCost(cache, game, card, "play", card.name, player, colors, cost, targets, prepared) != "string"
  );
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
    random: true,
    number: number,
    excludes: [card, ...(filter.excludes ?? [])],
  });

  for (const target of cards) {
    yield* this.revealCard(cache, game, card, { target });
  }

  if (cards.length < number) {
    const aliveCards = this.filter(cache, game, {
      ...filter,
      hidden: true,
      random: true,
      number: number - cards.length,
      zones: ["deck", "board"],
      excludes: [card, ...cards, ...(filter.excludes ?? [])],
    });

    for (const target of aliveCards) {
      yield* this.revealCard(cache, game, card, { target });
    }

    if (cards.length + aliveCards.length < number) {
      const allCards = this.filter(cache, game, {
        ...filter,
        hidden: true,
        random: true,
        number: number - cards.length,
        zones: ["deck", "board", "grave"],
        excludes: [card, ...cards, ...aliveCards, ...(filter.excludes ?? [])],
      });

      for (const target of allCards) {
        yield* this.revealCard(cache, game, card, { target });
      }
    }
  }
}

export type CardInfoCache = Map<string, CardInfo>;

const defaultCache = new Map();
export function getDefaultCardInfo(this: Util, card: CardState) {
  return this.getCardInfo(defaultCache, initialGameState(), card);
}

export function getCardInfo(this: Util, cache: CardInfoCache, game: GameState, card: CardState): CardInfo {
  if (cache.has(card.id)) {
    return cache.get(card.id)!;
  } else {
    cache.set(
      card.id,
      runPartialCardInfoComputation(() => ({}), this, cache, game, card)
    );
    const baseInfo = runPartialCardInfoComputation(this.getCardInfoImpl(card), this, cache, game, card);
    cache.set(card.id, baseInfo);
    const info = this.updateCardInfo(cache, game, card, baseInfo);
    cache.set(card.id, info);
    return info;
  }
}

export function updateCardInfo(this: Util, cache: CardInfoCache, game: GameState, state: CardState, info: CardInfo) {
  if (!findCard(game, state)) {
    return info;
  }

  cache.set(state.id, info);

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

  for (const modifier of state.modifiers) {
    const card = getCard(game, modifier.card);
    if (card) {
      const modifiers = this.getCardInfo(cache, game, card).modifiers ?? {};
      info = { ...info, ...modifiers[modifier.name](info, modifier, state) };
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

export function onTrigger<T extends GameParams>(
  trigger: (payload: T) => GameAction,
  selector?: (info: CardInfo, game: GameState) => CardTrigger<T>,
  init: boolean = false
) {
  return function* (
    this: GetCardInfo,
    cache: CardInfoCache,
    game: GameState,
    source: Target | undefined,
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

function* onEndTurn(this: Util, cache: CardInfoCache, game: GameState, payload: NoActionParams): CardGenerator {
  for (const card of this.filter(cache, game, { zones: ["board"], players: [currentPlayer(game)] })) {
    if (card.props.delayed != undefined) {
      yield* this.setProp(cache, game, card, {
        target: card,
        name: "delayed",
        value: card.props.delayed > 1 ? card.props.delayed - 1 : undefined,
      });
      yield* this.exhaustCard(cache, game, card, { target: card });
    }

    if (card.props.collection != undefined) {
      yield* this.setProp(cache, game, card, {
        target: card,
        name: "collection",
        value: card.props.collection > 1 ? card.props.collection - 1 : undefined,
      });

      if (card.props.collection <= 1) {
        const player = util.findCard(game, card)?.player;
        const info = this.getCardInfo(cache, game, card);
        const money = info.keywords.filter((k): k is ["debt", number] => k[0] == "debt").reduce((a, b) => a + b[1], 0);
        yield* this.removeMoney(cache, game, card, { player, money });
      }
    }
  }

  yield endTurn(payload);
}

function* onAdd(info: CardInfo, payload: AddCardParams): CardGenerator {
  yield* info.onAdd(payload);

  if (info.keywords.some((k) => k[0] == "protected")) {
    yield protectCard(payload);
  }
}

function* onRemove(info: CardInfo, game: GameState, payload: TargetCardParams): CardGenerator {
  const state = getCard(game, payload.target);

  if (state && !state.protected) {
    yield* info.onRemove(payload);
  }
}

function* onExhaust(info: CardInfo, game: GameState, payload: TargetCardParams): CardGenerator {
  const state = getCard(game, payload.target);
  if (state && state.props.absconding > 0) {
    yield setProp({
      target: payload.target,
      name: "absconding",
      value: state.props.absconding > 1 ? state.props.absconding - 1 : undefined,
    });

    if (state.props.absconding <= 1) {
      yield removeCard({ source: payload.target, target: payload.target });
    }
  }

  yield* info.onExhaust(payload);
}

function* onReveal(info: CardInfo, game: GameState, payload: TargetCardParams): CardGenerator {
  const state = getCard(game, payload.target);

  if (state && state.hidden) {
    yield* info.onReveal(payload);
  }
}

function setUndone(game: GameState, payload: SetUndoneParams) {
  return historySlice.actions.setUndone({ index: game.history.length - payload.index - 1 });
}

function* onPlayCard(
  this: Util,
  cache: CardInfoCache,
  game: GameState,
  source: Target | undefined,
  payload: Omit<PlayCardParams, "source">
): CardGenerator {
  yield playCard({ source, ...payload });

  const state = getCard(game, payload.target);
  if (state) {
    const info = this.getCardInfo(cache, game, state);
    yield* info.onPlay({ ...payload, source });

    const totalDelay = info.keywords
      .filter((k): k is ["delay", number] => k[0] == "delay")
      .reduce((a, b) => a + b[1], 0);
    if (totalDelay > 0) {
      yield setProp({ target: payload.target, name: "delayed", value: totalDelay });
    }

    const minAbscond = info.keywords
      .filter((k): k is ["abscond", number] => k[0] == "abscond")
      .reduce((a, b) => Math.min(a, b[1]), 1000);

    if (minAbscond < 1000) {
      yield setProp({ target: payload.target, name: "absconding", value: minAbscond });
    }

    if (info.keywords.some((k) => k[0] == "debt")) {
      yield setProp({ target: payload.target, name: "collection", value: 2 });
    }

    const totalExpunge = {
      cards: info.keywords.filter(([name, type]) => name == "expunge" && type == "card").length,
      agents: info.keywords.filter(([name, type]) => name == "expunge" && type == "agent").length,
      operations: info.keywords.filter(([name, type]) => name == "expunge" && type == "operation").length,
    };

    const lowestCards = this.filter(cache, game, {
      players: [util.self(game, state)],
      zones: ["deck"],
      types: ["operation"],
      random: true,
      ordering: ["money"],
    });

    const lowestAgents = this.filter(cache, game, {
      players: [util.self(game, state)],
      zones: ["deck"],
      types: ["agent"],
      random: true,
      ordering: ["money"],
    });

    const lowestOperations = this.filter(cache, game, {
      players: [util.self(game, state)],
      zones: ["deck"],
      types: ["operation"],
      random: true,
      ordering: ["money"],
    });

    if (lowestCards.length < totalExpunge.cards) {
      throw "Not enough cards to expunge";
    }

    if (lowestAgents.length < totalExpunge.agents) {
      throw "Not enough agents to expunge";
    }

    if (lowestOperations.length < totalExpunge.operations) {
      throw "Not enough operations to expunge";
    }

    for (const target of [
      ...lowestCards.slice(0, totalExpunge.cards),
      ...lowestAgents.slice(0, totalExpunge.agents),
      ...lowestOperations.slice(0, totalExpunge.operations),
    ]) {
      yield* this.removeCard(cache, game, state, { target });
    }

    if (payload.type == "operation") {
      yield* info.onRemove(payload);
    } else {
      yield* info.onEnter(payload);
    }
  }

  if (source) {
    const sourcePlayer = findCard(game, source)?.player;
    const targetPlayer = findCard(game, payload.target)?.player;

    if (sourcePlayer != targetPlayer) {
      const reveal: TargetCardParams = { source: source, target: source };
      yield* this.revealCard(cache, game, source, { target: source });

      const state = getCard(game, source);
      if (state) {
        const info = this.getCardInfo(cache, game, state);
        yield* info.onReveal(reveal);
      }
    }
  }
}

const util = {
  endTurn: onEndTurn,
  addCard: onTrigger(addCard, (info, game) => triggerReveal(info, game, (p) => onAdd(info, p)), true),
  playCard: onPlayCard,
  removeCard: onTrigger(removeCard, (info, game) => triggerReveal(info, game, (p) => onRemove(info, game, p))),
  enterCard: onTrigger(enterCard, (info, game) => triggerReveal(info, game, info.onEnter)),
  bounceCard: onTrigger(bounceCard, (info, game) => triggerReveal(info, game, info.onBounce)),
  stealCard: onTrigger(stealCard, (info, game) => triggerReveal(info, game, info.onSteal)),
  revealCard: onTrigger(revealCard, (info, game) => triggerReveal(info, game, (p) => onReveal(info, game, p))),
  refreshCard: onTrigger(refreshCard, (info, game) => triggerReveal(info, game, info.onRefresh)),
  exhaustCard: onTrigger(exhaustCard, (info, game) => triggerReveal(info, game, (p) => onExhaust(info, game, p))),
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
  getDefaultCardInfo,
  getCardInfo,
  keywordModifier,
  cid,
  random,
  randoms,
  noop,
};

export type GetCardInfo = {
  getCardInfo: (cache: CardInfoCache, game: GameState, card: CardState) => CardInfo;
  getCardInfoImpl: (card: { name: string }) => PartialCardInfoComputation;
};

export type Util = typeof util & GetCardInfo;

export default util;
