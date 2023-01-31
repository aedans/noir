// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  text: "Remove an agent.",
  type: "operation",
  cost: { money: 6, agents: 1 },
  colors: ["purple"],
  targets: {
    types: ["agent"],
  },
  play: function* (target) {
    yield* util.removeCard(cache, game, card, { target });
  },
});
