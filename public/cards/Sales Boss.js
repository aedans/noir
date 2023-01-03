// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, game, card) => ({
    text: "Every other turn: gain a Disloyal Company Salesman.",
    type: "agent",
    cost: { money: 12 },
    colors: ["green"],
    turn: function* () {
      const turns = card.props.turns ?? 0;
  
      yield* util.setProp(game, {
        card,
        name: "turns",
        value: (turns + 1) % 2,
      });
  
      if (turns == 0) {
        yield* util.addCard(game, {
          card: util.cid(),
          name: "Company Salesman",
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
  