// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  type: "agent",
  text: "Activate this: set a card in your opponent's deck Aflame.",
  keywords: [["vip"]],
  cost: { money: 9 },
  colors: ["orange"],
  activateTargets: {
    zones: ["deck"],
    players: [util.opponent(game, card)],
  },
  activate: function* (target) {
    yield* util.modifyCard(cache, game, card, {
      target,
      modifier: {
        card,
        name: "fired",
      },
    });
  },
  modifiers: {
    fired: (info, modifier, card) => ({
      keywords: [["flammable", 1]],
    }),
  },
});
