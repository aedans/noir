// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, game, card) => ({
  text: "Remove an agent and each other agent of the same color on your opponent's board.",
  type: "operation",
  cost: { money: 13, agents: 3 },
  targets: {
    types: ["agent"],
  },
  play: function* (target) {
    const mcnuke = util.getCard(game, target);
    const mccolor = util.getCardInfo(game, mcnuke).colors;
    const mcnukers = util.filter(game, {
      colors: mccolor,
      players: [util.opponent(game, card)],
      zones: ["board"],
    });
    for (const dead of mcnukers) {
      yield* util.removeCard(game, card, { target: dead });
    }
  },
});
