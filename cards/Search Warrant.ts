import type { PartialCardInfoComputation } from "../common/card";

export const card: PartialCardInfoComputation = (util, cache, game, card) => ({
  text: "Reveal four of your opponent's operations.",
  type: "operation",
  cost: { money: 2, agents: 1 },
  play: function* () {
    yield* util.revealRandom(cache, game, card, 4, {
      zones: ["deck", "board"],
      types: ["operation"],
    });
  },
});
