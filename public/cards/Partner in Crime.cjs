// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  type: "agent",
  text: "Exhaust this and another purple agent: steal a card from your opponent's deck, putting it hidden into your deck.",
  keywords: [["vip"]],
  cost: { money: 13 },
  colors: ["purple"],
  activateTargets: {
    zones: ["deck"],
  },
  activateCost: { agents: 1 },
  activate: function* (target) {
    yield* util.modifyCard(cache, game, card, {
      target,
      modifier: {
        card,
        name: "porple",
      },
    });
    yield* util.stealCard(cache, game, card, { target, zone: "deck" });
  },
  modifiers: {
    porple: (info, modifier, card) => ({
      colors: ["purple"],
    }),
  },
});
