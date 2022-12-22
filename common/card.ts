import { DeepPartial } from "redux";
import { GameAction, GameState } from "./gameSlice";
import { Util } from "./util";

export type CardState = {
  id: string;
  name: string;
  hidden: boolean;
  prepared: boolean;
  props: any;
};

export const cardColors = ["orange", "blue", "green", "purple"] as const;
export const cardTypes = ["agent", "location", "operation"] as const;

export type CardColor = typeof cardColors[number];
export type CardType = typeof cardTypes[number];
export type CardColorFilter = CardColor | "any";

export type CardCost = {
  money: number;
  agents: number;
};

export type CardInfo = {
  text: string;
  type: CardType;
  colors: CardColor[];
  cost: CardCost;
  targets?: () => Target[];
  play: (target: Target) => Generator<GameAction, void, GameState>;
  activateCost: CardCost;
  activateTargets?: () => Target[];
  activate: (target: Target) => Generator<GameAction, void, GameState>;
  hasActivateEffect: boolean;
  activationPriority: number;
  turn: () => Generator<GameAction, void, GameState>;
};

export type PartialCardInfoComputation = (
  util: Util,
  game: GameState,
  card: CardState
) => { [K in keyof CardInfo]?: DeepPartial<CardInfo[K]> } & {
  colors?: CardColor[];
  targets?: () => Target[];
  play?: (target: Target) => Generator<GameAction, void, GameState>;
  activateTargets?: () => Target[];
  activate?: (target: Target) => Generator<GameAction, void, GameState>;
  hasActivateEffect?: boolean;
  turn?: () => Generator<GameAction, void, GameState>;
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
    targets: partial.targets,
    play: partial.play ?? function* () {},
    activateCost,
    activateTargets: partial.activateTargets,
    activate: partial.activate ?? function* () {},
    hasActivateEffect: partial.hasActivateEffect ?? partial.activate != undefined,
    activationPriority: 0,
    turn: partial.turn ?? function* () {},
  };
}
