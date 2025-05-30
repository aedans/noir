import type { PartialCardInfoComputation } from "../common/card";

export const card: PartialCardInfoComputation = (util, cache, game, card) => ({
  text: "Reveal a card in your opponent's deck.",
  type: "operation",
  cost: { money: 0 },
  play: function* () {
    yield* util.revealRandom(cache, game, card, 1, {
      zones: ["deck"],
    });
  }
});
