// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  type: "agent",
  text: "Activate this and another blue agent: remove an operation.",
  cost: { money: 9 },
  colors: ["blue"],
  keywords: ["protected"],
  activateCost: { agents: 1 },
  activateTargets: {
    types: ["operation"],
    zones: ["deck", "board"],
  },
  activate: function* (target) {
    yield* util.removeCard(cache, game, card, { target });
  },
});
