// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  type: "agent",
  text: "Activate this and another purple agent: steal a card from your opponent's deck, putting it hidden into your deck.",
  cost: { money: 12 },
  colors: ["purple"],
  activateTargets: {
    zones: ["deck"],
  },
  activateCost: { agents: 1 },
  activate: function* (target) {
    yield* util.stealCard(cache, game, card, { target, zone: "deck" });
  },
});
