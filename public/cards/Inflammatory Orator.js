// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  text: "Every other turn: gain a Disloyal Disruntled Civilian.",
  type: "agent",
  cost: { money: 10, agents: 1 },
  colors: ["orange"],
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
        player: util.findCard(game, card).player,
        zone: "board",
      });

      yield* util.modifyCard(cache, game, card, { target, modifier: { card, name: "disloyalorange" } });
    }
  },
  modifiers: {
    disloyalorange: (info) => ({
      keywords: [["disloyal"]],
      colors: ["orange"],
    }),
  },
});
