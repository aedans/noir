//@ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  type: "agent",
  text: "[3]: remove a card.",
  cost: { money: 16 },
  keywords: [["disloyal"], ["protected"]],
  activateCost: { agents: 3 },
  activateTargets: {
    zones: ["board", "deck"],
  },
  activate: function* (target) {
    yield* util.removeCard(cache, game, card, { target });
    yield* util.refreshCard(cache, game, card, { target: card });
  },
  activateFactor: "negative",
  evaluateActivate: (settings) => [settings.removeValue, settings.removeValueFactor],
});
