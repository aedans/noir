// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  type: "agent",
  text: "Exhaust this and another blue agent: remove an agent.",
  cost: { money: 14 },
  colors: ["blue"],
  keywords: [["protected"]],
  activateCost: { agents: 1 },
  activateTargets: {
    zones: ["board", "deck"],
    types: ["agent"],
  },
  activate: function* (target) {
    yield* util.removeCard(cache, game, card, { target });
  },
});
