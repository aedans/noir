// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  text: "Remove one of your opponent's agents.",
  type: "operation",
  cost: { money: 3, agents: 1 },
  keywords: [["tribute", "agent"]],
  targets: {
    types: ["agent"],
    zones: ["board", "deck"],
  },
  colors: ["purple"],
  play: function* (target) {
    yield* util.removeCard(cache, game, card, { target });
  },
});
