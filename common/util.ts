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
  defaultCardState,
  initialGameState,
  addAgents,
  removeAgents,
  ChangeAgentsParams,
  RevealCardParams,
} from "./gameSlice.js";
import CardInfoCache from "./CardInfoCache.js";
import { Deck } from "../common/decks.js";

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
          return this.canPayCost(cache, game, card, player, info.colors, info.cost, info.targets);
        });
      }

      if (filter.activatable != undefined && filter.activatable) {
        f = f.filter((card) => {
          const info = cache.getCardInfo(game, card);
          return (
            !card.exhausted &&
            info.hasActivate &&
            this.canPayCost(cache, game, card, player, info.colors, info.activateCost, info.activateTargets)
          );
        });
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
    const info = cache.getCardInfo(initialGameState(), defaultCardState(name, `${name} ${count}`));
    errors.push(...info.validateDeck(deck));
    actualSize += count;
    expectedSize += info.modifyDeckSize(deck);
  }

  if (actualSize > expectedSize) {
    errors.push(`Deck cannot have more than ${expectedSize} cards`);
  }

  return { errors, actualSize, expectedSize };
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
  targets: Filter | undefined
): string | { agents: number; money: number } {
  if (cost.money > 0 && game.players[player].money < cost.money) {
    return `Not enough money to ${verb} ${name}`;
  }

  if (cost.agents > 0 && game.players[player].agents < cost.agents) {
    return `Not enough agents to ${verb} ${name}`;
  }

  const agents = util.filter(cache, game, {
    types: ["agent"],
    players: [player],
    zones: ["board"],
    exhausted: false,
    colors,
  });

  if (agents.length < cost.agents) {
    return `Not enough colored agents to ${verb} ${name}`;
  }

  if (targets != undefined && this.getTargets(cache, game, card, targets).length == 0) {
    return `No valid targets for ${name}`;
  }

  return {
    agents: cost.agents,
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
  filter: Omit<Filter, "players" | "hidden" | "number"> = {}
): CardGenerator<CardState[]> {
  const opponent = util.opponent(game, card);
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
    const { player, zone } = findCard(game, target)!;
    yield* this.revealCard(cache, game, card, { target, player, zone });
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
    if (payload.source) {
      game = yield noop({});
      const { player, zone, index } = findCard(game, payload.source)!;
      const targetPlayer = selectTarget
        ? (selectTarget as (payload: T) => PlayerId)(payload)
        : findCard(game, payload.target!)?.player;

      if (player != targetPlayer) {
        const target = game.players[player][zone][index];
        const reveal: RevealCardParams = { source: payload.source, target, player, zone };
        yield revealCard(reveal);
        yield* info.onReveal(reveal);
      }

      if (trigger) {
        yield* trigger(payload);
      }
    }
  };
}

export function* revealSource(
  util: Util,
  cache: CardInfoCache,
  game: GameState,
  source: Target | undefined,
  payload: Omit<TargetCardParams, "source">
) {
  if (source) {
    const { player, zone, index } = findCard(game, source)!;
    const targetPlayer = findCard(game, payload.target)?.player;

    if (player != targetPlayer) {
      const target = game.players[player][zone][index];
      const reveal: RevealCardParams = { source, target, player, zone };
      yield* util.revealCard(cache, game, source, reveal);

      const state = getCard(game, source);
      if (state) {
        const info = cache.getCardInfo(game, state);
        yield* info.onReveal(reveal);
      }
    }
  }
}

function* onAdd(info: CardInfo, payload: AddCardParams): CardGenerator {
  yield* info.onAdd(payload);

  if (info.keywords.some((k) => k[0] == "protected")) {
    yield setProp({ target: payload.target, name: "protected", value: true });
  }
}

function* onReveal(info: CardInfo, game: GameState, payload: RevealCardParams): CardGenerator {
  game = yield noop({});
  const state = getCard(game, payload.target);

  if (state && state.hidden) {
    yield* info.onReveal(payload);
  }
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
  addCard: onTrigger<AddCardParams>(addCard, (info, game) => triggerReveal(info, game, (p) => onAdd(info, p)), true),
  activateCard: onTrigger<TargetCardParams>(activateCard, (info, game) => triggerReveal(info, game, info.onActivate)),
  removeCard: onRemoveCard,
  enterCard: onTrigger<TargetCardParams>(enterCard, (info, game) => triggerReveal(info, game, info.onEnter)),
  bounceCard: onTrigger<TargetCardParams>(bounceCard, (info, game) => triggerReveal(info, game, info.onBounce)),
  stealCard: onTrigger<StealCardParams>(stealCard, (info, game) => triggerReveal(info, game, info.onSteal)),
  revealCard: onTrigger<RevealCardParams>(revealCard, (info, game) =>
    triggerReveal(info, game, (p) => onReveal(info, game, p))
  ),
  refreshCard: onTrigger<TargetCardParams>(refreshCard, (info, game) => triggerReveal(info, game, info.onRefresh)),
  exhaustCard: onTrigger<TargetCardParams>(exhaustCard, (info, game) => triggerReveal(info, game, info.onExhaust)),
  setProp: onTrigger<SetPropParams>(setProp, (info, game) => triggerReveal(info, game, info.onSetProp)),
  modifyCard: onTrigger<ModifyCardParams>(modifyCard, (info, game) => triggerReveal(info, game, info.onModify)),
  addMoney: onTrigger<ChangeMoneyParams>(addMoney, (info, game) =>
    triggerReveal(info, game, undefined, (p) => p.player)
  ),
  removeMoney: onTrigger<ChangeMoneyParams>(removeMoney, (info, game) =>
    triggerReveal(info, game, undefined, (p) => p.player)
  ),
  addAgents: onTrigger<ChangeAgentsParams>(addAgents, (info, game) =>
    triggerReveal(info, game, undefined, (p) => p.player)
  ),
  removeAgents: onTrigger<ChangeAgentsParams>(removeAgents, (info, game) =>
    triggerReveal(info, game, undefined, (p) => p.player)
  ),
  findCard: findCard as (game: GameState, card: Target) => { player: PlayerId; zone: Zone; index: number },
  getCard: getCard as (game: GameState, card: Target) => CardState,
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
  isRevealed,
  noop,
};

export type Util = typeof util;

export default util;
