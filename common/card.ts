import { DeepPartial } from "redux";
import { DeepComputation } from "./computation";
import { GameState } from "./gameSlice";

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
};

export type PartialCardInfo = DeepPartial<CardInfo>;
export type CardInfoComputation = { [K in keyof CardInfo]: DeepComputation<CardInfo[K]> };
export type PartialCardInfoComputation = { [K in keyof PartialCardInfo]: DeepComputation<PartialCardInfo[K]> };

export function defaultCardInfoComputation(partial: PartialCardInfoComputation): CardInfoComputation {
  const agents: CardCost["agents"] = {
    orange: partial.cost?.agents?.orange ?? 0,
    blue: partial.cost?.agents?.blue ?? 0,
    green: partial.cost?.agents?.green ?? 0,
    purple: partial.cost?.agents?.purple ?? 0,
    any: partial.cost?.agents?.any ?? 0,
  };

  const cost: CardCost = {
    money: partial.cost?.money ?? 0,
    agents,
  };

  return {
    text: partial.text ?? "",
    cost,
    type: partial.type ?? "operation",
  };
}

export function runCardInfoComputation(computation: CardInfoComputation, card: CardState, game: GameState): CardInfo {
  return computation;
}
