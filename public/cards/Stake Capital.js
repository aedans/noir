// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, game, card) => ({
  text: "In two turns, gain $8.",
  type: "operation",
  cost: { money: 2, agents: 1 },
  colors: ["green"],
  onPlay: function* () {
    yield* util.enterCard(game, card, { target: card });
  },
  onEnter: function* () {
    yield* util.setProp(game, card, { target: card, name: "turns", value: 2 });
  },
  turn: function* () {
    if (card.props.turns === 0) {
      yield* util.addMoney(game, card, { player: util.self(game, card), money: 8 });
      yield* util.removeCard(game, card, { target: card });
      yield* util.setProp(game, card, { target: card, name: "turns", value: undefined });
    } else {
      yield* util.setProp(game, card, { target: card, name: "turns", value: card.props.turns - 1 });
    }
  },
});
