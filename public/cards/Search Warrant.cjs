// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  text: "Reveal four operations in your opponent's deck.",
  type: "operation",
  cost: { money: 3, agents: 2 },
  colors: ["blue"],
  play: function* () {
    yield* util.revealRandom(cache, game, card, 4, {
      zones: ["deck"],
      types: ["operation"],
    });
  },
});
