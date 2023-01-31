// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  text: "Gain $1.",
  type: "operation",
  onAdd: function* () {
    yield* util.revealCard(cache, game, card, { target: card });
  },
  play: function* () {
    yield* util.addMoney(cache, game, card, {
      player: util.findCard(game, card).player,
      money: 1,
    });
  },
});
