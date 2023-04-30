//@ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  text: "Each turn: if your opponent has at least five revealed agents, remove one of them.",
  type: "agent",
  cost: { money: 8 },
  colors: ["orange"],
  turn: function* () {
    if (util.filter(cache, game, { hidden: false, zones: ["board", "deck"], players: [util.opponent(game,card)], types: ["agent"] }).length >= 5) {
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
