//@ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  text: "Every other turn: if your opponent has at least four revealed agents, remove one of them.",
  type: "agent",
  cost: { money: 7 },
  colors: ["orange"],
  onEnter: function* () {
    yield* util.setProp(cache, game, card, { target: card, name: "turns", value: 0 });
  },
  turn: function* () {
    yield* util.setProp(cache, game, card, { target: card, name: "turns", value: (card.props.turns + 1) % 2 });

    if (card.props.turns == 1) {
      if (
        util.filter(cache, game, {
          hidden: false,
          zones: ["board", "deck"],
          players: [util.opponent(game, card)],
          types: ["agent"],
        }).length >= 4
      ) {
        const cards = util.filter(cache, game, {
          hidden: false,
          zones: ["board", "deck"],
          players: [util.opponent(game, card)],
          types: ["agent"],
        });
        for (const target of util.randoms(cards, 1)) {
          yield* util.removeCard(cache, game, card, { target });
        }
      }
    }
  },
});
