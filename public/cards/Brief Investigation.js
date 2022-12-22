// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, game, card) => ({
  text: "Reveal two cards in your opponent's deck.",
  type: "operation",
  cost: { money: 2 },
  play: function* () {
    const cards = util.filter(game, {
      players: [util.opponent(util.cardOwner(game, card))],
      zones: ["deck"],
    });

    for (const card of util.randoms(cards, 2)) {
      yield util.revealCard({ card });
    }
  }
});