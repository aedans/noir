// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, game, card) => ({
  text: "Each turn: gain $4.",
  type: "agent",
  cost: { money: 18 },
  keywords: ["disloyal", "protected"],
  turn: function* () {
    yield* util.addMoney(game, card, {
      player: util.currentPlayer(game),
      money: 4,
    });
  },
});
