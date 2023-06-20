// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  type: "agent",
  cost: { money: 8 },
  text: "Whenever this is exhausted, reveal a card in your opponent's deck, or their board if all cards in their deck are revealed.",
  colors: ["blue"],
  onExhaust: function* () {
    if (util.filter(cache, game, { hidden: true, zones: ["deck"], players: [util.opponent(game, card)] }).length > 0) {
      yield* util.revealRandom(cache, game, card, 1, {
        zones: ["deck"],
      });
    } else {
      yield* util.revealRandom(cache, game, card, 1, {
        zones: ["board"],
      });
    }
  },
});
