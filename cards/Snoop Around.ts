import type { PartialCardInfoComputation } from "../common/card";

export const card: PartialCardInfoComputation = (util, cache, game, card) => ({
  text: "Reveal two cards.",
  type: "operation",
  cost: { money: 2, agents: 1 },
  play: function* () {
    yield* util.revealRandom(cache, game, card, 2, {});
  },
  evaluate: (ai) => [ai.settings.revealValue * 2, 0],
});
