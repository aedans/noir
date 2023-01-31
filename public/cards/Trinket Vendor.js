// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  type: "agent",
  text: "Whenever this is activated, gain $1.",
  cost: { money: 8 },
  colors: ["green"],
  onExhaust: function* () {
    yield* util.addMoney(cache, game, card, {
      player: util.currentPlayer(game),
      money: 1,
    });
  },
});
