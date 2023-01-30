// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, game, card) => ({
  text: "Gain $10. At the end of your turn in your deck, reduce this card's cost by $1.",
  cost: { money: 10 - Math.trunc(game.turn / 2), agents: 1 },
  colors: ["green"],
  type: "operation",
  play: function* () {
    yield* util.addMoney(game, card, {
      player: util.findCard(game, card).player,
      money: 10,
    });
  },
});
