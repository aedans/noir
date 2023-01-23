// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, game, card) => ({
  text: "Remove an agent.",
  type: "operation",
  cost: { money: 0, agents: 3 },
  colors: ["orange"],
  targets: {
    types: ["agent"],
  },
  play: function* (target) {
    yield* util.removeCard(game, card, { target });
  },
});
