// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  text: "Set a card in your opponent's deck Alight.",
  type: "operation",
  cost: { money: 0, agents: 2 },
  colors: ["orange"],
  targets: {
    zones: ["deck"],
    players: [util.opponent(game, card)],
  },
  play: function* (target) {
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
