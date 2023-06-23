// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  text: "Every other turn: add a Disloyal New Hire to your deck.",
  type: "agent",
  cost: { money: 10 },
  colors: ["purple"],
  onEnter: function* () {
    yield* util.setProp(cache, game, card, { target: card, name: "turns", value: 0 });
  },
  turn: function* () {
    yield* util.setProp(cache, game, card, { target: card, name: "turns", value: (card.props.turns + 1) % 2 });

    if (card.props.turns == 0) {
      const target = util.cid();
      yield* util.addCard(cache, game, card, {
        target,
        name: "New Hire",
        player: util.getCard(game, card).player,
        zone: "deck",
      });

      yield* util.modifyCard(cache, game, card, { target, modifier: { card, name: "disloyal" } });
    }
  },
  modifiers: {
    disloyal: util.keywordModifier(["disloyal"]),
  },
});
