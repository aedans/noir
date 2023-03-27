// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  text: "Additional cost: remove an orange agent on your board. Reveal five cards from your opponent's deck",
  type: "operation",
  cost: { money: 1, agents: 1 },
  colors: ["orange"],
  targets: {
    types: ["agent"],
    players: [util.self(game, card)],
    zones: ["board"],
  },
  play: function* (target) {
    yield* util.revealRandom(cache, game, card, 5, {
      players: [util.opponent(game, card)],
      zones: ["deck"],
    });
    yield* util.removeCard(cache, game, card, { target });
  },
});
