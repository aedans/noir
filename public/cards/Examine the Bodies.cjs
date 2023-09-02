// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  text: "Reveal one of your opponent's cards. Repeat this for each agent that has been removed.",
  type: "operation",
  cost: { money: 2, agents: 1 },
  keywords: [["tribute", "agent"]],
  colors: ["purple"],
  play: function* () {
    yield* util.revealRandom(cache, game, card, 2 + util.filter(cache, game, {
      zones: ["grave"],
      types: ["agent"],
      excludes: [card],
    }).length, {
      zones: ["board"],
    });
  },
});
