// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, game, card) => ({
  text: "Reveal one of your opponent's cards.",
  type: "operation",
  cost: { money: 2 },
  play: function* () {
    yield* util.revealRandom(game, card, 1, {
      players: [util.opponent(game, card)],
      zones: ["board"],
    });
  },
});