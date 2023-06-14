// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  text: "When this is removed while on your board, two cards in your deck gain Expunge.",
  type: "agent",
  cost: { money: 4 },
  colors: ["purple"],
  play: function* () {
    util.setProp(cache, game, card, { target: card, name: "onboard", value: true });
  },
  onRemove: function* () {
    const cards = util.filter(cache, game, {
      players: [util.self(game, card)],
      colors: ["purple"],
      zones: ["deck"],
      excludes: [card],
    });
    const punger = util.randoms(cards, 2);
    if (card.props.onboard == true) {
      yield* util.modifyCard(cache, game, card, {
        target: punger[0],
        modifier: {
          card,
          name: "Expunge",
        },
      });
      yield* util.modifyCard(cache, game, card, {
        target: punger[1],
        modifier: {
          card,
          name: "Expunge",
        },
      });
    }
  },
  modifiers: {
    Expunge: util.keywordModifier(["expunge", "agent"]),
  },
});
