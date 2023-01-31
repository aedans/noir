// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  type: "operation",
  text: "Put an agent on the board back into its owner's deck.",
  cost: { money: 0, agents: 2 },
  colors: ["blue"],
  targets: {
    types: ["agent"],
  },
  play: function* (target) {
    yield* util.bounceCard(cache, game, card, { target: target });
  },
});
