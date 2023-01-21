import { DeepPartial } from "redux";
import { AddCardParams, GameAction, GameState, ModifyCardParams, TargetCardParams } from "./gameSlice";
import { HistoryAction } from "./historySlice";
import { Filter, Util } from "./util";

export type ModifierState = {
  card: Target;
  name: string;
};

export type CardState = {
  id: string;
  name: string;
  hidden: boolean;
  exhausted: boolean;
  protected: boolean;
  props: { [name: string]: any };
  modifiers: ModifierState[];
};

export const cardColors = ["orange", "blue", "green", "purple"] as const;
export const cardTypes = ["agent", "operation"] as const;
export const cardKeywords = ["disloyal", "protected", "vip"] as const;

export type CardColor = typeof cardColors[number];
export type CardType = typeof cardTypes[number];
export type CardKeyword = typeof cardKeywords[number];
export type CardColorFilter = CardColor | "any";

export type CardCost = {
  money: number;
  agents: number;
};

export type CardGenerator = Generator<GameAction | HistoryAction, void, GameState>;
export type CardAction = () => CardGenerator;
export type CardTargetAction = (target: Target) => CardGenerator;
export type CardModifier = (card: CardInfo, modifier: ModifierState) => Partial<CardInfo>;
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
  hasActivateEffect: boolean;
  activationPriority: number;
  turn: CardAction;
  effectFilter: Filter,
  effect: CardEffect;
  modifiers: { [name: string]: CardModifier };
  onAdd: CardTrigger<AddCardParams>;
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
  game: GameState,
  card: CardState
) => { [K in keyof CardInfo]?: DeepPartial<CardInfo[K]> } & {
  colors?: CardColor[];
  keywords?: CardKeyword[];
  play?: CardTargetAction;
  activate?: CardTargetAction;
  turn?: CardAction;
  effect?: CardEffect;
  modifiers?: { [name: string]: CardModifier };
  onAdd?: CardTrigger<AddCardParams>;
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
  game: GameState,
  card: CardState
): CardInfo {
  const partial = computation(util, game, card);

  const cost: CardCost = Object.assign(
    {
      money: 0,
      agents: 0,
    },
    partial.cost ?? {}
  );

  const activateCost: CardCost = Object.assign(
    {
      money: 0,
      agents: 0,
    },
    partial.activateCost ?? {}
  );

  const hasActivateEffect = partial.activate != undefined;
  let activationPriority = partial.activationPriority ?? 0;

  if (partial.colors && partial.colors.length > 0) {
    activationPriority -= partial.colors.length * 100;
  }

  if (hasActivateEffect) {
    activationPriority -= 1000;
  }

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
    hasActivateEffect,
    activationPriority: activationPriority,
    turn: partial.turn ?? function* () {},
    effect: partial.effect ?? (() => ({})),
    effectFilter: partial.effectFilter ?? {},
    modifiers: partial.modifiers ?? {},
    onAdd: partial.onAdd ?? function* () {},
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
