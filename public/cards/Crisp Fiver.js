// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = {
  text: "Gain $5",
  type: "operation",
  play: function* (util, game, card) {
    yield util.addMoney({
      player: util.cardOwner(game, card),
      money: 5,
    })
  }
}