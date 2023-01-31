// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  text: "Remove an agent in your opponent's deck.",
  type: "operation",
  cost: { money: 6 },
  targets: {
    types: ["agent"],
    zones: ["deck"],
  },
  play: function* (target) {
    yield* util.removeCard(cache, game, card, { target });
  },
});
