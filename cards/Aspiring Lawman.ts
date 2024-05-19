import type { PartialCardInfoComputation } from "../common/card";

export const card: PartialCardInfoComputation = (util, cache, game, card) => ({
  type: "agent",
  keywords: [["delay", 1]],
  cost: { money: 4 },
  colors: ["blue"],
});
