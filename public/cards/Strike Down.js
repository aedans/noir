// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, game, card) => ({
  text: "Remove an agent.",
  type: "operation",
  cost: { money: 10, agents: 1 },
  targets: {
    types: ["agent"],
  },
  play: function* (target) {
    yield* util.removeCard(game, card, { target });
  },
});
