import { DeepPartial } from "redux";
import { GameAction, GameState } from "./gameSlice";
import { Util } from "./util";

export type ModifierState = {
  card: Target;
  name: string;
};

export type CardState = {
  id: string;
  name: string;
  hidden: boolean;
  exhausted: boolean;
  props: any;
  modifiers: ModifierState[];
};

export const cardColors = ["orange", "blue", "green", "purple"] as const;
export const cardTypes = ["agent", "location", "operation"] as const;
export const cardKeywords = ["disloyal", "protected", "vip"] as const;

export type CardColor = typeof cardColors[number];
export type CardType = typeof cardTypes[number];
export type CardKeyword = typeof cardKeywords[number];
export type CardColorFilter = CardColor | "any";

export type CardCost = {
  money: number;
  agents: number;
};

export type CardAction = () => Generator<GameAction, void, GameState>;
export type CardTargetAction = (target: Target) => Generator<GameAction, void, GameState>;
export type CardModifier = (card: CardInfo, modifier: ModifierState) => Partial<CardInfo>;
export type CardTargets = () => Target[];

export type CardInfo = {
  text: string;
  type: CardType;
  colors: CardColor[];
  cost: CardCost;
  keywords: CardKeyword[];
  targets?: CardTargets;
  play: CardTargetAction;
  activateCost: CardCost;
  activateTargets?: CardTargets;
  activate: CardTargetAction;
  hasActivateEffect: boolean;
  activationPriority: number;
  turn: CardAction;
  modifiers: { [name: string]: CardModifier };
};

export type PartialCardInfoComputation = (
  util: Util,
  game: GameState,
  card: CardState
) => { [K in keyof CardInfo]?: DeepPartial<CardInfo[K]> } & {
  colors?: CardColor[];
  keywords?: CardKeyword[];
  targets?: CardTargets;
  play?: CardTargetAction;
  activateTargets?: CardTargets;
  activate?: CardTargetAction;
  hasActivateEffect?: boolean;
  turn?: CardAction;
  modifiers?: { [name: string]: CardModifier };
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
    hasActivateEffect: partial.hasActivateEffect ?? partial.activate != undefined,
    activationPriority: 0,
    turn: partial.turn ?? function* () {},
    modifiers: partial.modifiers ?? {},
  };
}
