import { Action, DeepPartial } from "redux";
import { GameState } from "./gameSlice";
import { Util } from "./util";

export type CardState = {
  id: string;
  name: string;
  props: any;
};

export const cardColors = ["orange", "blue", "green", "purple"] as const;
export const cardTypes = ["agent", "location", "operation"] as const;

export type CardColor = typeof cardColors[number];
export type CardType = typeof cardTypes[number];
export type CardColorFilter = CardColor | "any";

export type CardCost = {
  money: number;
  agents: { [color in CardColorFilter]: number };
};

export type CardInfo = {
  text: string;
  cost: CardCost;
  type: CardType;
  targets?: () => Target[];
  play: (target: Target) => Generator<Action, void, GameState>;
  turn: () => Generator<Action, void, GameState>;
};

export type PartialCardInfoComputation = (
  util: Util,
  game: GameState,
  card: CardState
) => { [K in keyof CardInfo]?: DeepPartial<CardInfo[K]> } & {
  targets?: () => Target[];
  play?: (target: Target) => Generator<Action, void, GameState>;
  turn?: () => Generator<Action, void, GameState>;
};

export type Target = { id: string };

export function runPartialCardInfoComputation(
  computation: PartialCardInfoComputation,
  util: Util,
  game: GameState,
  card: CardState
): CardInfo {
  const partial = computation(util, game, card);

  const agents: CardCost["agents"] = Object.assign(
    {
      orange: 0,
      blue: 0,
      green: 0,
      purple: 0,
      any: 0,
    },
    partial.cost?.agents ?? {}
  );

  const cost: CardCost = Object.assign(
    {
      money: 0,
      agents,
    },
    partial.cost ?? {}
  );

  return {
    text: partial.text ?? "",
    cost,
    type: partial.type ?? "operation",
    targets: partial.targets,
    play: partial.play ?? (function* () {}),
    turn: partial.turn ?? (function* () {}),
  };
}
