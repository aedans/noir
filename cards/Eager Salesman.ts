import type { PartialCardInfoComputation } from "../common/card";

export const card: PartialCardInfoComputation = (util, cache, game, card) => ({
  type: "agent",
  cost: { money: 4 },
  colors: ["green"],
  keywords: [["debt", 2]],
});
