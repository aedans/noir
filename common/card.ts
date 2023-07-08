import { DeepPartial } from "redux";
import {
  AddCardParams,
  GameAction,
  GameState,
  ModifyCardParams,
  PlayCardParams,
  TargetCardParams,
} from "./gameSlice.js";
import { HistoryAction } from "./historySlice.js";
import { Filter, Util } from "./util.js";
import CardInfoCache from "./CardInfoCache.js";
import { Deck } from "./decksSlice.js";

export type CardStateInfo = {
  state: CardState;
  info: CardInfo;
};

export type ModifierState = {
  card: Target;
  name: string;
};

export type CardState = {
  id: string;
  name: string;
  hidden: boolean;
  exhausted: boolean;
  activated: boolean;
  props: { [name: string]: any };
  modifiers: ModifierState[];
};

export type CardCosmetic = {
  level: 0 | 1 | 2 | 3 | "top";
};

export const cardColors = ["orange", "blue", "green", "purple"] as const;
export const cardTypes = ["agent", "operation"] as const;
export const cardKeywords = [
  () => ["disloyal"] as const,
  () => ["protected"] as const,
  () => ["vip"] as const,
  (n?: number) => ["delay", n ?? 0] as const,
  (n?: number) => ["debt", n ?? 0] as const,
  (n?: number) => ["depart", n ?? 0] as const,
  (n?: CardType) => ["tribute", n ?? "card"] as const,
] as const;

export type CardColor = (typeof cardColors)[number];
export type CardType = (typeof cardTypes)[number];
export type CardKeyword = ReturnType<(typeof cardKeywords)[number]>;
export type CardColorFilter = CardColor | "any";
export type CardColors = CardColor | "multicolor" | "colorless";

export type CardCost = {
  money: number;
  agents: number;
};

export type CardGenerator = Generator<GameAction | HistoryAction, void, any>;
export type CardAction = () => CardGenerator;
export type CardTargetAction = (target: Target) => CardGenerator;
export type CardModifier = (card: CardInfo, modifier: ModifierState, state: CardState) => Partial<CardInfo>;
export type CardEffect = (card: CardInfo, state: CardState) => Partial<CardInfo> | undefined;
export type CardTrigger<T> = (payload: T) => CardGenerator;

export type CardInfo = {
  text: string;
  type: CardType;
  colors: CardColor[];
  cost: CardCost;
  keywords: CardKeyword[];
  targets?: Filter;
  play: CardTargetAction;
  activateCost: CardCost;
  activateTargets?: Filter;
  activate: CardTargetAction;
  hasActivate: boolean;
  activationPriority: number;
  turn: CardAction;
  hasEffect: boolean;
  effectFilter: Filter;
  effect: CardEffect;
  hasSecondaryEffect: boolean;
  secondaryEffectFilter: Filter;
  secondaryEffect: CardEffect;
  modifiers: { [name: string]: CardModifier };
  validateDeck: (deck: Deck) => string[];
  modifyDeckSize: (deck: Deck) => number;
  onAdd: CardTrigger<AddCardParams>;
  onPlay: CardTrigger<PlayCardParams>;
  onActivate: CardTrigger<TargetCardParams>;
  onRemove: CardTrigger<TargetCardParams>;
  onEnter: CardTrigger<TargetCardParams>;
  onBounce: CardTrigger<TargetCardParams>;
  onSteal: CardTrigger<TargetCardParams>;
  onReveal: CardTrigger<TargetCardParams>;
  onRefresh: CardTrigger<TargetCardParams>;
  onExhaust: CardTrigger<TargetCardParams>;
  onSetProp: CardTrigger<TargetCardParams>;
  onModify: CardTrigger<ModifyCardParams>;
};

export type PartialCardInfoComputation = (
  util: Util,
  cache: CardInfoCache,
  game: GameState,
  card: CardState
) => { [K in keyof CardInfo]?: DeepPartial<CardInfo[K]> } & {
  colors?: CardColor[];
  keywords?: CardKeyword[];
  targets?: Filter;
  play?: CardTargetAction;
  activateTargets?: Filter;
  activate?: CardTargetAction;
  turn?: CardAction;
  effectFilter?: Filter;
  effect?: CardEffect;
  secondaryEffectFilter?: Filter;
  secondaryEffect?: CardEffect;
  modifiers?: { [name: string]: CardModifier };
  onAdd?: CardTrigger<AddCardParams>;
  onPlay?: CardTrigger<PlayCardParams>;
  onActivate?: CardTrigger<TargetCardParams>;
  onRemove?: CardTrigger<TargetCardParams>;
  onEnter?: CardTrigger<TargetCardParams>;
  onBounce?: CardTrigger<TargetCardParams>;
  onSteal?: CardTrigger<TargetCardParams>;
  onReveal?: CardTrigger<TargetCardParams>;
  onRefresh?: CardTrigger<TargetCardParams>;
  onExhaust?: CardTrigger<TargetCardParams>;
  onSetProp?: CardTrigger<TargetCardParams>;
  onModify?: CardTrigger<ModifyCardParams>;
};

export type Target = { id: string };

export function runPartialCardInfoComputation(
  computation: PartialCardInfoComputation,
  util: Util,
  cache: CardInfoCache,
  game: GameState,
  card: CardState
): CardInfo {
  const partial = computation(util, cache, game, card);

  const cost: CardCost = {
    money: partial.cost?.money ?? 0,
    agents: partial.cost?.agents ?? 0,
  };

  const activateCost: CardCost = {
    money: partial.activateCost?.money ?? 0,
    agents: partial.activateCost?.agents ?? 0,
  };

  const hasActivate = partial.hasActivate ?? partial.activate != undefined;
  let activationPriority = partial.activationPriority ?? 40;

  if (partial.colors && partial.colors.length > 0) {
    activationPriority -= partial.colors.length * 10;
  }

  if (partial.keywords && partial.keywords.some((k) => k != null && k[0] == "depart")) {
    activationPriority -= 4000;
  }

  if (hasActivate) {
    activationPriority -= 100;
  }

  const hasEffect = partial.hasEffect ?? partial.effect != undefined;
  const hasSecondaryEffect = partial.hasSecondaryEffect ?? partial.secondaryEffect != undefined;

  return {
    text: partial.text ?? "",
    type: partial.type ?? "operation",
    colors: partial.colors ?? [],
    cost,
    keywords: partial.keywords ?? [],
    targets: partial.targets,
    play: partial.play ?? function* () {},
    activateCost,
    activateTargets: partial.activateTargets,
    activate: partial.activate ?? function* () {},
    hasActivate: hasActivate,
    activationPriority,
    turn: partial.turn ?? function* () {},
    hasEffect,
    effect: partial.effect ?? (() => ({})),
    effectFilter: partial.effectFilter ?? {},
    hasSecondaryEffect,
    secondaryEffect: partial.secondaryEffect ?? (() => ({})),
    secondaryEffectFilter: partial.secondaryEffectFilter ?? {},
    modifiers: partial.modifiers ?? {},
    validateDeck: (deck) => (deck.cards[card.name] > 2 ? [`Cannot run more than two copies of ${card.name}`] : []),
    modifyDeckSize: () => 0,
    onAdd: partial.onAdd ?? function* () {},
    onPlay: partial.onPlay ?? function* () {},
    onActivate: partial.onActivate ?? function* () {},
    onRemove: partial.onRemove ?? function* () {},
    onEnter: partial.onEnter ?? function* () {},
    onBounce: partial.onBounce ?? function* () {},
    onSteal: partial.onSteal ?? function* () {},
    onReveal: partial.onReveal ?? function* () {},
    onRefresh: partial.onRefresh ?? function* () {},
    onExhaust: partial.onExhaust ?? function* () {},
    onSetProp: partial.onSetProp ?? function* () {},
    onModify: partial.onSetProp ?? function* () {},
  };
}
