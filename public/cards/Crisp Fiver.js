// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, game, card) => ({
  text: "Gain $5",
  type: "operation",
  play: function* () {
    yield util.addMoney({
      player: util.cardOwner(game, card),
      money: 5,
    })
  }
});