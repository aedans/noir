// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  type: "agent",
  text: "This can't be activated the turn after it is played",
  cost: { money: 4 },
  colors: ["blue"],
  onEnter: function* () {
    yield* util.setProp(cache, game, card, { target: card, name: "training", value: (card.props.training ?? 0) + 1 });
  },
  turn: function* () {
    if (card.props.training > 0 ) {
      yield* util.setProp(cache, game, card, { target: card, name: "training", value: card.props.training - 1 });
      yield* util.exhaustCard(cache, game, card, { target: card });
    } else {
      yield* util.setProp(cache, game, card, { target: card, name: "training", value: undefined })}
  },
});
