// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  type: "agent",
  text: "Activate this, exhaust two purple agents: steal a card from your opponent's deck. It becomes purple.",
  keywords: [["vip"]],
  cost: { money: 12 },
  colors: ["purple"],
  activateTargets: {
    zones: ["deck"],
    players: [util.opponent(game, card)],
  },
  activateCost: { agents: 2 },
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
