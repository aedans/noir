// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, game, card) => ({
  text: "Remove an agent.",
  type: "operation",
  cost: { money: 6, agents: 1 },
  colors: ["purple"],
  targets: {
    types: ["agent"],
  },
  play: function* (target) {
    yield* util.removeCard(game, { card: target });
  },
});
