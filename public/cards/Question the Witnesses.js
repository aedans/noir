// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  text: "Costs $1 less for each revealed agent. Reveal four hidden cards in your opponent's deck.",
  type: "operation",
  cost: {
    money: 16 - util.filter(cache, game, { hidden: false, types: ["agent"], excludes: [card] }).length,
    agents: 1,
  },
  play: function* () {
    yield* util.revealRandom(cache, game, card, 4, {
      players: [util.opponent(game, card)],
      zones: ["deck"],
    });
  },
});
