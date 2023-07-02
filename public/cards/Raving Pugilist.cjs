//@ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  text: "Every other turn: if your opponent has at least three revealed agents, remove one of them.",
  type: "agent",
  cost: { money: 7 },
  colors: ["orange"],
  turn: function* () {
    if (card.exhausted == false) {
      if (
        util.filter(cache, game, {
          hidden: false,
          zones: ["board", "deck"],
          players: [util.opponent(game, card)],
          types: ["agent"],
        }).length >= 3
      ) {
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
    }
  },
});
