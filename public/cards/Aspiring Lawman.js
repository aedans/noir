// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, game, card) => ({
  type: "agent",
  text: "This can't be activated the turn after it is played",
  cost: { money: 4 },
  colors: ["blue"],
  onEnter: function* () {
    yield* util.setProp(game, card, { target: card, name: "exhausted", value: true });
  },
  turn: function* () {
    if (card.props.exhausted == true) {
      yield* util.setProp(game, card, { target: card, name: "exhausted", value: undefined });
      yield* util.exhaustCard(game, card, { target: card });
    }
  },
});
