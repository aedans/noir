// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  type: "operation",
  text: "Delay 2. Remove each of your opponent's revealed cards that cost $12 or less.",
  cost: { money: 8, agents: 4 },
  colors: ["blue"],
  onPlay: function* () {
    yield* util.enterCard(cache, game, card, { target: card });
  },
  onEnter: function* () {
    yield* util.setProp(cache, game, card, { target: card, name: "turns", value: 2 });
  },
  turn: function* () {
    if (card.props.turns === 0) {
      const cards = util.filter(cache, game, {
        hidden: false,
        players: [util.opponent(game, card)],
        maxMoney: 12,
      });
      for (const card of cards) {
        yield* util.removeCard(cache, game, card, { target: card });
      }
      yield* util.removeCard(cache, game, card, { target: card });
      yield* util.setProp(cache, game, card, { target: card, name: "turns", value: undefined });
    } else {
      yield* util.setProp(cache, game, card, { target: card, name: "turns", value: card.props.turns - 1 });
    }
  },
});
