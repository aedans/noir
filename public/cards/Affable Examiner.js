// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, game, card) => ({
  type: "agent",
  text: "When you play this, put a copy of this hidden into your deck",
  cost: { money: 5 },
  play: function* () {
    yield* util.addCard(game, card, {
      target: util.cid(),
      name: "Affable Examiner",
      player: util.findCard(game, card).player,
      zone: "deck",
    });
  },
});
