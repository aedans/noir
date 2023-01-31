// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  type: "agent",
  text: "Activate this: remove a card in your opponent's deck",
  cost: { money: 18 },
  keywords: ["disloyal", "protected"],
  activateTargets: {
    zones: ["deck"],
  },
  activate: function* (target) {
    yield* util.removeCard(cache, game, card, { target });
  },
});
