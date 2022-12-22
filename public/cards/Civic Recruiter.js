// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, game, card) => ({
  text: "Every other turn: gain a Disloyal Civil Servant.",
  type: "agent",
  cost: { money: 12 },
  colors: ["blue"],
  turn: function* () {
    const turns = card.props.turns ?? 0;

    yield util.setProp({
      card,
      name: "turns",
      value: (turns + 1) % 2,
    });

    if (turns == 0) {
      yield util.addCard({
        card: util.cid(),
        name: "Civic Servant",
        player: util.cardOwner(game, card),
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
