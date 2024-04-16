// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  type: "agent",
  text: "[A][E]: remove an agent.",
  cost: { money: 12 },
  colors: ["blue"],
  keywords: [["protected"], ["delay", 1]],
  activateCost: { agents: 1 },
  activateTargets: {
    zones: ["board", "deck"],
    types: ["agent"],
  },
  activate: function* (target) {
    yield* util.removeCard(cache, game, card, { target });
  },
});
