// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  text: "Expunge: agent. Reveal two cards from your opponent's deck and two from their board.",
  type: "operation",
  cost: { money: 3, agents: 1 },
  keywords: [["expunge", "agent"]],
  colors: ["purple"],
  play: function* () {
    yield* util.revealRandom(cache, game, card, 2, {
      players: [util.opponent(game, card)],
      zones: ["deck"],
    });
    yield* util.revealRandom(cache, game, card, 2, {
      players: [util.opponent(game, card)],
      zones: ["board"],
    });
  },
});
