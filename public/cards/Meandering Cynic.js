// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, game, card) => ({
  type: "agent",
  text: "When you activate this, reveal it.",
  cost: { money: 4 },
  colors: ["orange"],
  onExhaust: function* () {
    yield* util.revealCard(game, card, { target: card });
  },
});
