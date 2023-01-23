// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, game, card) => ({
  text: "Every other turn: gain a Disloyal Civil Servant.",
  type: "agent",
  cost: { money: 12 },
  colors: ["blue"],
  onEnter: function* () {
    yield* util.setProp(game, card, { target: card, name: "turns", value: 0 });
  },
  turn: function* () {
    yield* util.setProp(game, card, { target: card, name: "turns", value: (card.props.turns + 1) % 2 });

    if (card.props.turns == 0) {
      yield* util.addCard(game, card, {
        target: util.cid(),
        name: "Civic Servant",
        player: util.findCard(game, card).player,
        zone: "board",
        state: {
          modifiers: [{ card, name: "disloyal" }],
        },
      });
    }
  },
  modifiers: {
    disloyal: util.keywordModifier("disloyal"),
  },
});
