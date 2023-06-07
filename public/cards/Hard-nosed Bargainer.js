// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  type: "agent",
  text: "Activate this: set a card in your opponent's deck aflame.",
  keywords: [["vip"]],
  cost: { money: 9 },
  colors: ["orange"],
  activateTargets: {
    zones: ["deck"],
    players: [util.opponent(game, card)],
  },
  activate: function* (target) {
    yield* util.setProp(cache, game, card, {
      target,
      name: "aflame",
      value: 2
    });
  },
});
