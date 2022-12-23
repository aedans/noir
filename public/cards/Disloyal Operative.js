// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, game, card) => ({
  text: "When this is removed, remove an agent in your deck",
  type: "agent",
  cost: { money: 4 },
  colors: ["purple"],
  onRemove: function* () {
    const removedCard = util.random(
      util.filter(game, {
        players: [util.findCard(game, card).player],
        zones: ["deck"],
        types: ["agent"],
      })
    );

    yield* util.removeCard(game, { card: removedCard });
  },
});
