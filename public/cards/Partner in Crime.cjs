// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  type: "agent",
  text: "[A][E]: steal a card from your opponent's deck. It becomes purple.",
  keywords: [["vip"]],
  cost: { money: 12 },
  colors: ["purple"],
  activateTargets: {
    zones: ["deck"],
    players: [util.opponent(game, card)],
  },
  activateCost: { agents: 1 },
  activate: function* (target) {
    yield util.modifyCard({
      source: card,
      target,
      modifier: {
        card,
        name: "porple",
      },
    });
    yield util.stealCard({ source: card, target, zone: "deck" });
  },
  modifiers: {
    porple: (info, modifier, card) => ({
      colors: ["purple"],
    }),
  },
});
