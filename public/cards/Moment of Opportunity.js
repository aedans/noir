// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  text: "Remove an agent. At the end of your turn, this card's cost increases by $1.",
  cost: { money: 3 + Math.trunc((game.turn - util.findCard(game, card).player + 1) / 2), agents: 1 },
  type: "operation",
  targets: {
    types: ["agent"],
  },
  play: function* (target) {
    yield* util.removeCard(cache, game, card, { target });
  },
});
