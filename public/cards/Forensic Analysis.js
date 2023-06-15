// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  text: "Costs $2 less for each revealed operation. Reveal four agents.",
  type: "operation",
  cost: {
    money: 16 - 2 * util.filter(cache, game, { hidden: false, types: ["agent"], excludes: [card] }).length,
    agents: 1,
  },
  play: function* () {
    yield* util.revealRandom(cache, game, card, 4, {
      types: ["agent"],
    });
  },
});
