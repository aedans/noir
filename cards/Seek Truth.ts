import type { PartialCardInfoComputation } from "../common/card";

export const card: PartialCardInfoComputation = (util, cache, game, card) => ({
  text: "Reveal three cards in your opponent's deck that cost $6 or less.",
  type: "operation",
  cost: { money: 1, agents: 1 },
  colors: ["blue"],
  play: function* () {
    yield* util.revealRandom(cache, game, card, 3, {
      zones: ["deck"],
      maxMoney: 6,
    });
  },
});
