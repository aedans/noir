// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  text: "Every other turn: gain a Disloyal Civil Servant.",
  type: "agent",
  cost: { money: 12 },
  colors: ["blue"],
  onEnter: function* () {
    yield* util.setProp(cache, game, card, { target: card, name: "turns", value: 0 });
  },
  turn: function* () {
    yield* util.setProp(cache, game, card, { target: card, name: "turns", value: (card.props.turns + 1) % 2 });

    if (card.props.turns == 0) {
      yield* util.addCard(cache, game, card, {
        target: util.cid(),
        name: "Random Citizen",
        player: util.findCard(game, card).player,
        zone: "board",
        state: {
          modifiers: [{ card, name: "disloyalblue" }],
        },
      });
    }
  },
  modifiers: {
    disloyalblue: (info) => ({
      keywords: ["disloyal"],
      colors: ["blue"],
    }),
  },
});
