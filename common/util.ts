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
  Target,
} from "./card.js";
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
  noop,
  NoActionParams,
  activateCard,
  ChangeMoneyParams,
  ModifyCardParams,
  SetPropParams,
  StealCardParams,
} from "./gameSlice.js";
import { historySlice, SetUndoneParams } from "./historySlice.js";
import _ from "lodash";
import CardInfoCache from "./CardInfoCache.js";

export type Filter = {
  excludes?: Target[];
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
  playable?: boolean;
  activatable?: boolean;
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

      if (filter.playable != undefined && filter.playable) {
        f = f.filter((card) => {
          const info = cache.getCardInfo(game, card);
          return this.canPayCost(cache, game, card, player, info.colors, info.cost, info.targets, []);
        });
      }

      if (filter.activatable != undefined && filter.activatable) {
        f = f.filter((card) => {
          const info = cache.getCardInfo(game, card);
          return (
            !card.exhausted &&
            info.hasActivate &&
            this.canPayCost(cache, game, card, player, info.colors, info.activateCost, info.activateTargets, [])
          );
        });
      }

      if (filter.hasActivate != undefined) {
        f = f.filter((card) => cache.getCardInfo(game, card).hasActivate == filter.hasActivate!);
      }

      for (const keyword of cardKeywords) {
        var name = keyword()[0];
        if (filter[name] != undefined) {
          f = f.filter((card) => cache.getCardInfo(game, card).keywords.some((k) => k[0] == name) == filter[name]!);
        }
      }

      cards.push(...f);
    }
  }

  if (filter.random != undefined && filter.random) {
    cards = _.shuffle(cards);
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
      return cache.getCardInfo(game, b).activationPriority - cache.getCardInfo(game, a).activationPriority;
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
  filter: Omit<Filter, "hidden"> = {}
): CardGenerator {
  const opponent = util.opponent(game, card);
  const cards = this.filter(cache, game, {
    zones: ["board"],
    players: [opponent],
    hidden: true,
    random: true,
    number: number,
    excludes: [card, ...(filter.excludes ?? [])],
    ...filter,
  });

  for (const target of cards) {
    yield* this.revealCard(cache, game, card, { target });
  }

  if (cards.length < number) {
    const aliveCards = this.filter(cache, game, {
      zones: ["deck", "board"],
      players: [opponent],
      hidden: true,
      random: true,
      number: number - cards.length,
      excludes: [card, ...cards, ...(filter.excludes ?? [])],
      ...filter,
    });

    for (const target of aliveCards) {
      yield* this.revealCard(cache, game, card, { target });
    }

    if (cards.length + aliveCards.length < number) {
      const allCards = this.filter(cache, game, {
        zones: ["deck", "board", "grave"],
        players: [opponent],
        hidden: true,
        random: true,
        number: number - cards.length - aliveCards.length,
        excludes: [card, ...cards, ...aliveCards, ...(filter.excludes ?? [])],
        ...filter,
      });

      for (const target of allCards) {
        yield* this.revealCard(cache, game, card, { target });
      }
    }
  }
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
        yield* selector(cache.getCardInfo(game, card), game)(payload);
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

function* revealSource(
  util: Util,
  cache: CardInfoCache,
  game: GameState,
  source: Target | undefined,
  payload: Omit<TargetCardParams, "source">
) {
  if (source) {
    const sourcePlayer = findCard(game, source)?.player;
    const targetPlayer = findCard(game, payload.target)?.player;

    if (sourcePlayer != targetPlayer) {
      const reveal: TargetCardParams = { source: source, target: source };
      yield* util.revealCard(cache, game, source, { target: source });

      const state = getCard(game, source);
      if (state) {
        const info = cache.getCardInfo(game, state);
        yield* info.onReveal(reveal);
      }
    }
  }
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
        const info = cache.getCardInfo(game, card);
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
    yield setProp({ target: payload.target, name: "protected", value: true });
  }
}

function* onExhaust(info: CardInfo, game: GameState, payload: TargetCardParams): CardGenerator {
  const state = getCard(game, payload.target);
  if (state && state.props.departing > 0) {
    yield setProp({
      target: payload.target,
      name: "departing",
      value: state.props.departing > 1 ? state.props.departing - 1 : undefined,
    });

    if (state.props.departing <= 1) {
      yield removeCard({ source: payload.target, target: payload.target });
    }
  }

  yield* info.onExhaust(payload);
}

function* onReveal(info: CardInfo, game: GameState, payload: TargetCardParams): CardGenerator {
  game = yield noop({});
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

  const card = getCard(game, payload.target);
  if (!card) {
    return;
  }

  const info = cache.getCardInfo(game, card);
  yield* info.onPlay({ ...payload, source });

  const totalDelay = info.keywords.filter((k): k is ["delay", number] => k[0] == "delay").reduce((a, b) => a + b[1], 0);
  if (totalDelay > 0) {
    yield setProp({ target: payload.target, name: "delayed", value: totalDelay });
  }

  const minDepart = info.keywords
    .filter((k): k is ["depart", number] => k[0] == "depart")
    .reduce((a, b) => Math.min(a, b[1]), 1000);

  if (minDepart < 1000) {
    yield setProp({ target: payload.target, name: "departing", value: minDepart });
  }

  if (info.keywords.some((k) => k[0] == "debt")) {
    yield setProp({ target: payload.target, name: "collection", value: 2 });
  }

  const totalTribute = {
    cards: info.keywords.filter(([name, type]) => name == "tribute" && type == "card").length,
    agents: info.keywords.filter(([name, type]) => name == "tribute" && type == "agent").length,
    operations: info.keywords.filter(([name, type]) => name == "tribute" && type == "operation").length,
  };

  const lowestCards = this.filter(cache, game, {
    players: [util.self(game, card)],
    zones: ["deck"],
    types: ["operation"],
    random: true,
    ordering: ["money"],
    excludes: [card],
  });

  const lowestAgents = this.filter(cache, game, {
    players: [util.self(game, card)],
    zones: ["deck"],
    types: ["agent"],
    random: true,
    ordering: ["money"],
    excludes: [card],
  });

  const lowestOperations = this.filter(cache, game, {
    players: [util.self(game, card)],
    zones: ["deck"],
    types: ["operation"],
    random: true,
    ordering: ["money"],
    excludes: [card],
  });

  if (lowestCards.length < totalTribute.cards) {
    throw "Not enough cards to tribute";
  }

  if (lowestAgents.length < totalTribute.agents) {
    throw "Not enough agents to tribute";
  }

  if (lowestOperations.length < totalTribute.operations) {
    throw "Not enough operations to tribute";
  }

  for (const target of [
    ...lowestCards.slice(0, totalTribute.cards),
    ...lowestAgents.slice(0, totalTribute.agents),
    ...lowestOperations.slice(0, totalTribute.operations),
  ]) {
    yield* this.removeCard(cache, game, card, { target });
  }

  if (payload.type == "operation") {
    yield* info.onRemove(payload);
  } else {
    yield* info.onEnter(payload);
  }

  yield* revealSource(this, cache, game, source, payload);
}

function* onRemoveCard(
  this: Util,
  cache: CardInfoCache,
  game: GameState,
  source: Target | undefined,
  payload: Omit<TargetCardParams, "source">
) {
  const card = getCard(game, payload.target);

  if (!card) {
    return;
  }

  const info = cache.getCardInfo(game, card);

  if (!card.props.protected) {
    yield removeCard({ source, ...payload });
    yield* info.onRemove(payload);
  } else {
    yield* this.setProp(cache, game, source, { target: payload.target, name: "protected", value: false });
  }

  yield* revealSource(this, cache, game, source, payload);
}

const util = {
  endTurn: onEndTurn,
  addCard: onTrigger<AddCardParams>(addCard, (info, game) => triggerReveal(info, game, (p) => onAdd(info, p)), true),
  playCard: onPlayCard,
  activateCard: onTrigger<TargetCardParams>(activateCard, (info, game) => triggerReveal(info, game, info.onActivate)),
  removeCard: onRemoveCard,
  enterCard: onTrigger<TargetCardParams>(enterCard, (info, game) => triggerReveal(info, game, info.onEnter)),
  bounceCard: onTrigger<TargetCardParams>(bounceCard, (info, game) => triggerReveal(info, game, info.onBounce)),
  stealCard: onTrigger<StealCardParams>(stealCard, (info, game) => triggerReveal(info, game, info.onSteal)),
  revealCard: onTrigger<TargetCardParams>(revealCard, (info, game) =>
    triggerReveal(info, game, (p) => onReveal(info, game, p))
  ),
  refreshCard: onTrigger<TargetCardParams>(refreshCard, (info, game) => triggerReveal(info, game, info.onRefresh)),
  exhaustCard: onTrigger<TargetCardParams>(exhaustCard, (info, game) =>
    triggerReveal(info, game, (p) => onExhaust(info, game, p))
  ),
  setProp: onTrigger<SetPropParams>(setProp, (info, game) => triggerReveal(info, game, info.onSetProp)),
  modifyCard: onTrigger<ModifyCardParams>(modifyCard, (info, game) => triggerReveal(info, game, info.onModify)),
  addMoney: onTrigger<ChangeMoneyParams>(addMoney, (info, game) =>
    triggerReveal(info, game, undefined, (p) => p.player)
  ),
  removeMoney: onTrigger<ChangeMoneyParams>(removeMoney, (info, game) =>
    triggerReveal(info, game, undefined, (p) => p.player)
  ),
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
  keywordModifier,
  cid,
  random,
  randoms,
  noop,
};

export type Util = typeof util;

export default util;
