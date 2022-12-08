import { Action, DeepPartial } from "redux";
import { GameState } from "./gameSlice";
import { Util } from "./util";

export type CardState = {
  id: string;
  name: string;
  props: any;
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
  targets?: () => Target[];
  play: (target: Target) => Iterable<Action>;
  turn: () => Iterable<Action>;
};

export type PartialCardInfoComputation = (
  util: Util,
  game: GameState,
  card: CardState
) => { [K in keyof CardInfo]?: DeepPartial<CardInfo[K]> } & {
  targets?: () => Target[];
  play?: (target: Target) => Iterable<Action>;
  turn?: () => Iterable<Action>;
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
    play: partial.play ?? (() => []),
    turn: partial.turn ?? (() => []),
  };
}
