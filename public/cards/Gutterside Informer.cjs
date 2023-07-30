// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  text: "Activate this, exhaust a purple agent: reveal your opponent's two lowest cost cards.",
  type: "agent",
  cost: { money: 8 },
  colors: ["purple"],
  activateCost: { agents: 1 },
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
      yield* util.revealCard(cache, game, card, { target: cards[1] });
    }
  },
});
