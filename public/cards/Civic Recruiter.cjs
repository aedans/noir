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
      const target = util.cid();
      yield* util.addCard(cache, game, card, {
        target,
        name: "Random Citizen",
        player: util.getCard(game, card).player,
        zone: "board",
      });

      yield* util.modifyCard(cache, game, card, { target, modifier: { card, name: "disloyalblue" } });
    }
  },
  modifiers: {
    disloyalblue: (info) => ({
      keywords: [["disloyal"]],
      colors: ["blue"],
    }),
  },
});
