// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, game, card) => ({
  text: "Gain $1.",
  type: "operation",
  play: function* () {
    yield* util.addMoney(game, {
      player: util.findCard(game, card).player,
      money: 1,
    });
  }
});