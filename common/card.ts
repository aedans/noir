import { DeepPartial } from "redux";
import { GameAction, GameState, gameSlice } from "./gameSlice.js";
import { Filter, Util } from "./util.js";
import CardInfoCache from "./CardInfoCache.js";
import { Deck } from "../common/decks.js";
import { CardKeyword } from "./keywords.js";
import { AIValues } from "../server/ai.js";

export type CardStateInfo = {
  state: CardState;
  info: CardInfo;
};

export type ModifierState = {
  card: Target;
  name: string;
  props: { [name: string]: any };
};

export type CardState = {
  id: string;
  name: string;
  hidden: boolean;
  exhausted: boolean;
  props: { [name: string]: any };
  modifiers: ModifierState[];
};

export type CardCosmetic = {
  level: 0 | 1 | 2 | 3;
  top: boolean;
};

export const cardColors = ["orange", "blue", "green", "purple"] as const;
export const cardTypes = ["agent", "operation"] as const;

export type CardColor = (typeof cardColors)[number];
export type CardType = (typeof cardTypes)[number];
export type CardColorFilter = CardColor | "any";
export type CardColors = CardColor | "multicolor" | "colorless";

export type CardCost = {
  money: number;
  agents: number;
};

export type CardEvaluation = {
  value: number;
  target?: Target;
};

export type CardGenerator<T = void> = Generator<GameAction, T>;
export type CardAction = () => CardGenerator;
export type CardTargetAction = (target: Target) => CardGenerator;
export type CardModifier = (card: CardInfo, modifier: ModifierState, state: CardState) => Partial<CardInfo>;
export type CardEffect = (card: CardInfo, state: CardState) => Partial<CardInfo> | undefined;
export type CardTrigger = (action: GameAction) => CardGenerator<boolean>;
export type CardEvaluator = (ai: AIValues) => CardEvaluation | undefined;

export type CardInfo = {
  type: CardType;
  colors: CardColor[];
  cost: CardCost;
  text: string;
  keywords: CardKeyword[];
  targets?: Filter;
  play: CardTargetAction;
  activateCost: CardCost;
  activateTargets?: Filter;
  activate: CardTargetAction;
  hasActivate: boolean;
  turn: CardAction;
  hasEffect: boolean;
  effectFilter: Filter;
  effect: CardEffect;
  hasSecondaryEffect: boolean;
  secondaryEffectFilter: Filter;
  secondaryEffect: CardEffect;
  modifiers: { [name: string]: CardModifier };
  validateDeck: (deck: Deck, state: CardState) => string[];
  modifyDeckSize: (deck: Deck) => number;
  onTarget: CardTrigger;
  evaluate?: CardEvaluator;
  evaluateActivate?: CardEvaluator;
};

export type PartialCardInfo = { [K in keyof CardInfo]?: DeepPartial<CardInfo[K]> } & {
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
  onTarget?: CardTrigger;
  evaluate?: CardEvaluator;
  evaluateActivate?: CardEvaluator;
};

export type PartialCardInfoComputation = (
  util: Util,
  cache: CardInfoCache,
  game: GameState,
  card: CardState
) => PartialCardInfo;

export type Target = { id: string };

export function fillPartialCardInfo(partial: PartialCardInfo): CardInfo {
  const cost: CardCost = {
    money: partial.cost?.money ?? 0,
    agents: partial.cost?.agents ?? 0,
  };

  const activateCost: CardCost = {
    money: partial.activateCost?.money ?? 0,
    agents: partial.activateCost?.agents ?? 0,
  };

  const hasActivate = partial.hasActivate ?? partial.activate != undefined;
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
    turn: partial.turn ?? function* () {},
    hasEffect,
    effect: partial.effect ?? (() => ({})),
    effectFilter: partial.effectFilter ?? {},
    hasSecondaryEffect,
    secondaryEffect: partial.secondaryEffect ?? (() => ({})),
    secondaryEffectFilter: partial.secondaryEffectFilter ?? {},
    modifiers: partial.modifiers ?? {},
    validateDeck: (deck, state) =>
      deck.cards[state.name] > 2 ? [`Cannot run more than two copies of ${state.name}`] : [],
    modifyDeckSize: () => 0,
    onTarget:
      partial.onTarget ??
      function* () {
        return false;
      },
    evaluate: partial.evaluate,
    evaluateActivate: partial.evaluateActivate,
  };
}

export function runCardGenerator<T>(state: GameState, generator: CardGenerator<T>): [GameAction[], GameState] {
  const actions: GameAction[] = [];
  for (const action of generator) {
    actions.push(action);
    state = gameSlice.reducer(state, action);
  }
  return [actions, state];
}
