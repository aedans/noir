// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  text: "Remove an agent and each other agent of the same color on your opponent's board.",
  type: "operation",
  cost: { money: 13, agents: 3 },
  targets: {
    types: ["agent"],
  },
  play: function* (target) {
    const mcnuke = util.getCard(game, target);
    const mccolor = util.getCardInfo(cache, game, mcnuke).colors;
    const mcnukers = util.filter(cache, game, {
      colors: mccolor,
      players: [util.opponent(game, card)],
      zones: ["board"],
    });
    for (const dead of mcnukers) {
      yield* util.removeCard(cache, game, card, { target: dead });
    }
  },
});
