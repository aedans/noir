// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, game, card) => ({
  type: "agent",
  text: "Activate this: steal an agent from your opponent, putting it onto your board revealed.",
  cost: { money: 30 },
  colors: ["green"],
  keywords: ["vip"],
  activateTargets: {
    zones: ["deck", "board"],
  },
  activate: function* (target) {
    yield* util.stealCard(game, card, { target, zone: "board" });
  },
});
