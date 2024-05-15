// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  text: "Additional cost: remove an orange agent on your board. Reveal five cards in your opponent's deck",
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
      zones: ["deck"],
    });
    yield util.removeCard({ source: card, target });
  },
});
