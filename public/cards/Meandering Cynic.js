// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  type: "agent",
  text: "When you activate this, reveal it.",
  cost: { money: 4 },
  colors: ["orange"],
  onExhaust: function* () {
    yield* util.revealCard(cache, game, card, { target: card });
  },
});
