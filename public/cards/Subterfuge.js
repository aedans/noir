// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  text: "Expunge. Steal an operation and put it hidden into your deck.",
  type: "operation",
  cost: { money: 0 },
  colors: ["purple"],
  keywords: [["expunge", "operation"]],
  targets: {
    players: [util.opponent(game, card)],
    types: ["operation"],
  },
  play: function* (target) {
    yield* util.stealCard(cache, game, card, { target, zone: "deck" });
  },
});
