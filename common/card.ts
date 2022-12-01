import { Action } from "redux";
import { GameState } from "./gameSlice";
import { Util } from "./util";

export type CardState = {
  id: string;
  name: string;
};

export type CardColor = "orange" | "blue" | "green" | "purple";
export type CardColorFilter = CardColor | "any";
export type CardType = "agent" | "location" | "operation";

export type CardCost = {
  money: number;
  agents: { [color in CardColorFilter]: number };
};

export type CardInfo = {
  text: string;
  cost: CardCost;
  type: CardType;
  turn: Iterable<Action>;
};

export type PartialCardInfoComputation = { [K in keyof CardInfo]?: DeepPartialComputation<CardInfo[K]> } & {
  turn?: Computation<Iterable<Action>>,
};

export type Computation<T> = T extends Function ? never : T | ((util: Util, game: GameState, card: CardState) => T);

export type DeepPartialComputation<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartialComputation<T[K]> : Computation<T[K]>;
};

export function runPartialCardInfoComputation(computation: PartialCardInfoComputation, util: Util, game: GameState, card: CardState): CardInfo {
  function runComputation<T>(c: Computation<T>): T {
    if (typeof c == "function") {
      return c(util, game, card);
    } else {
      return c as T;
    }
  }

  const agents: CardCost["agents"] = Object.assign({
    orange: 0,
    blue: 0,
    green: 0,
    purple: 0,
    any: 0,
  }, runComputation(computation.cost?.agents ?? {}));

  const cost: CardCost = Object.assign({
    money: 0,
    agents
  }, runComputation(computation.cost ?? {}));

  return {
    text: runComputation(computation.text ?? ""),
    cost,
    type: runComputation(computation.type ?? "operation"),
    turn: runComputation(computation.turn ?? []),
  };
}
