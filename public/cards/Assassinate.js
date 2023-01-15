// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, game, card) => ({
  text: "Remove an agent in your opponent's deck.",
  type: "operation",
  cost: { money: 6 },
  targets: {
    types: ["agent"],
    zones: ["deck"],
  },
  play: function* (target) {
    yield* util.removeCard(game, { card: target });
  },
});
