// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  type: "agent",
  cost: { money: 8 },
  text: "Whenever this is activated, reveal a card in your opponent's deck.",
  colors: ["blue"],
  onExhaust: function* () {
    yield* util.revealRandom(cache, game, card, 1, {
      players: [util.opponent(game, card)],
      zones: ["deck"],
    });
  },
});
