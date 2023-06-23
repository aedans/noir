// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  text: "Gain $15. At the end of your turn in your deck, reduce this card's cost by $1.",
  cost: { money: 12 - Math.trunc(game.turn / 2), agents: 1 },
  colors: ["green"],
  keywords: [["debt", 5]],
  type: "operation",
  play: function* () {
    yield* util.addMoney(cache, game, card, {
      player: util.getCard(game, card).player,
      money: 15,
    });
  },
});
