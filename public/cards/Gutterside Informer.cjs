// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  text: "Activate this: reveal your opponent's lowest cost card.",
  type: "agent",
  cost: { money: 8 },
  colors: ["purple"],
  activate: function* () {
    const cards = util.filter(cache, game, {
      hidden: true,
      ordering: ["money"],
      reversed: false,
      zones: ["board", "deck"],
      players: [util.opponent(game, card)],
    });

    if (cards.length > 0) {
      yield* util.revealCard(cache, game, card, { target: cards[0] });
    }
  },
});
