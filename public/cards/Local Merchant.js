// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  text: "Each turn: gain $1.",
  type: "agent",
  cost: { money: 6 },
  keywords: [["disloyal"], ["protected"]],
  turn: function* () {
    yield* util.addMoney(cache, game, card, {
      player: util.currentPlayer(game),
      money: 1,
    });
  },
});
