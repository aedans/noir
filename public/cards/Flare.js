// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, game, card) => ({
  text: "Reveal two of your opponent's cards.",
  type: "operation",
  cost: { money: 2, agents: 1 },
  colors: ["blue"],
  play: function* () {
    yield* util.revealRandom(game, card, 2, {
      players: [util.opponent(game, card)],
      zones: ["board"],
    });
  },
});
