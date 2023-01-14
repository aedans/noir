//ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, game, card) => ({
  text: "Activate this: reveal your opponent's lowest cost card.",
  type: "agent",
  cost: { money: 10 },
  colors: ["purple"],
  activate: function* () {
    const cards = util.filter(game, {
      hidden: true,
      ordering: ["money"],
      reversed: false,
      players: [util.opponent(game,card)],
    });

    if (cards.length > 0) {
      yield* util.revealCard(game, { card: cards[0] });
    }
  },
});
  