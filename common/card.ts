export type CardType = "agent" | "operation" | "location";
export type CardColor = "orange" | "blue" | "green" | "purple";

export type CardCost = {
  money: number;
  agents: { [K in CardColor | "any"]: number };
};

export type CardComputation<T> = T;

export type CardInfo = {
  text: CardComputation<string>;
  type: CardComputation<CardType>;
  cost: CardComputation<CardCost>;
};
