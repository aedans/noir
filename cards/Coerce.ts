import type { PartialCardInfoComputation } from "../common/card";

export const card: PartialCardInfoComputation = (util, cache, game, card) => ({
  text: "Reveal two cards.",
  type: "operation",
  cost: { money: 0, agents: 2 },
  colors: ["orange"],
  play: function* () {
    yield* util.revealRandom(cache, game, card, 2, {});
  },
});