// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  text: "Reveal two cards in your opponent's deck and two on their board.",
  type: "operation",
  cost: { money: 3, agents: 1 },
  keywords: [["tribute", "agent"]],
  colors: ["purple"],
  play: function* () {
    yield* util.revealRandom(cache, game, card, 2, {
      zones: ["deck"],
    });
    yield* util.revealRandom(cache, game, card, 2, {
      zones: ["board"],
    });
  },
});
