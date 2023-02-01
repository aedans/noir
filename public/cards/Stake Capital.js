// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  text: "In two turns, gain $9.",
  type: "operation",
  cost: { money: 3, agents: 1 },
  colors: ["green"],
  onPlay: function* () {
    yield* util.enterCard(cache, game, card, { target: card });
  },
  onEnter: function* () {
    yield* util.setProp(cache, game, card, { target: card, name: "turns", value: 2 });
  },
  turn: function* () {
    if (card.props.turns === 0) {
      yield* util.addMoney(cache, game, card, { player: util.self(game, card), money: 9 });
      yield* util.removeCard(cache, game, card, { target: card });
      yield* util.setProp(cache, game, card, { target: card, name: "turns", value: undefined });
    } else {
      yield* util.setProp(cache, game, card, { target: card, name: "turns", value: card.props.turns - 1 });
    }
  },
});
