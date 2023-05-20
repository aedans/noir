// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  text: "When you play or Expunge this, reveal three of your opponent's cards.",
  type: "operation",
  colors: ["purple"],
  cost: { money: 3, agents: 1 },
  onRemove: function* () {
    if (util.currentPlayer(game) == util.self(game, card)) {
      yield* util.revealRandom(cache, game, card, 3, {
        players: [util.opponent(game, card)],
        zones: ["board"],
      });
    }
  },
  play: function* () {
    yield* util.revealRandom(cache, game, card, 3, {
      players: [util.opponent(game, card)],
      zones: ["board"],
    });
  },
});
