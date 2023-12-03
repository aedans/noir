// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  text: "Reveal a card in your opponent's deck.",
  type: "operation",
  cost: { money: 0 },
  play: function* () {
    yield* util.revealRandom(cache, game, card, 1, {
      zones: ["deck"],
    });
  },
  evaluate: (ai) => [ai.settings.revealDeckValue, 0],
});
