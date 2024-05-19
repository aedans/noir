import type { PartialCardInfoComputation } from "../common/card";

export const card: PartialCardInfoComputation = (util, cache, game, card) => ({
  type: "agent",
  text: "This costs $1 less for each agent that has been removed this game.",
  cost: {
    money:
      8 -
      util.filter(cache, game, {
        zones: ["grave"],
        types: ["agent"],
        excludes: [card],
      }).length,
  },
  colors: ["orange"],
});
