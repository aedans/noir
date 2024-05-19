import type { PartialCardInfoComputation } from "../common/card";

export const card: PartialCardInfoComputation = (util, cache, game, card) => ({
  text: "Costs $1 less for each revealed agent. Reveal six of your opponent's cards.",
  type: "operation",
  cost: {
    money: 16 - util.filter(cache, game, { hidden: false, types: ["agent"], excludes: [card] }).length,
    agents: 1,
  },
  play: function* () {
    yield* util.revealRandom(cache, game, card, 6, {
      zones: ["board"],
    });
  },
});
