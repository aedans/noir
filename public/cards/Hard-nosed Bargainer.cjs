// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  type: "agent",
  text: "Exhaust this: set a card in your opponent's deck on fire. It is removed two turns from now if not played.",
  keywords: [["vip"]],
  cost: { money: 9 },
  colors: ["orange"],
  activateTargets: {
    zones: ["deck"],
    players: [util.opponent(game, card)],
  },
  activate: function* (target) {
    yield* util.modifyCard(cache, game, card, { target, modifier: { name: "aflame", card } });
    yield* util.setProp(cache, game, card, {
      target,
      name: "aflame",
      value: 2,
    });
  },
  modifiers: {
    aflame: (info) => info,
  },
});
