//@ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  text: "Each turn: if there are at least eight revealed agents, remove one of your opponent's agents.",
  type: "agent",
  cost: { money: 9 },
  colors: ["orange"],
  turn: function* () {
    if (util.filter(cache, game, { hidden: false, zones: ["board", "deck"], types: ["agent"] }).length >= 8) {
      const cards = util.filter(cache, game, {
        hidden: false,
        players: [util.opponent(game, card)],
        types: ["agent"],
      });
      for (const target of util.randoms(cards, 1)) {
        yield* util.removeCard(cache, game, card, { target });
      }
      yield* util.exhaustCard(cache, game, card, { target: card });
    }
  },
});
