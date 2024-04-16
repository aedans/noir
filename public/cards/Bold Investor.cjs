// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  type: "agent",
  text: "[A]: gain $12 and remove this.",
  cost: { money: 8 },
  colors: ["green"],
  activate: function* () {
    yield* util.addMoney(cache, game, card, {
      player: util.currentPlayer(game),
      money: 12,
    });
    yield* util.removeCard(cache, game, card, { target: card });
  },
});
