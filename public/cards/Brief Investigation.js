// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, game, card) => ({
  text: "Reveal two cards in your opponent's deck.",
  type: "operation",
  cost: { money: 2 },
  play: function* () {
    yield* util.revealRandom(game, card, 2, {
      players: [util.opponent(game, card)],
      zones: ["deck"],
    });
  },
});
