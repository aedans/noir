import type { PartialCardInfoComputation } from "../common/card";

export const card: PartialCardInfoComputation = (util, cache, game, card) => ({
  type: "agent",
  cost: { money: 3 },
  colors: ["orange"],
  keywords: [["depart", 4]],
});
