//@ts-check

/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  type: "agent",
  text: "Exhaust this and three other agents: remove a revealed card and refresh this.",
  cost: { money: 18 },
  keywords: [["disloyal"], ["protected"]],
  activateCost: { agents: 3 },
  activateTargets: {
    zones: ["board", "deck"],
  },
  activate: function* (target) {
    yield* util.removeCard(cache, game, card, { target });
    yield* util.refreshCard(cache, game, card, { target: card });
  },
});
