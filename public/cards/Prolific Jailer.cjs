// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  type: "agent",
  text: "Activate this, exhaust two blue agents: remove an agent.",
  cost: { money: 13 },
  colors: ["blue"],
  keywords: [["protected"]],
  activateCost: { agents: 2 },
  activateTargets: {
    zones: ["board", "deck"],
    types: ["agent"],
  },
  activate: function* (target) {
    yield* util.removeCard(cache, game, card, { target });
  },
});
