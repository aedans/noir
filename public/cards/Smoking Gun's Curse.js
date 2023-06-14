// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  text: "Give one of your opponent’s agents “whenever this is exhausted, two random card in your deck gain Tribute: Agent”.",
  type: "operation",
  cost: { money: 2, agents: 1 },
  colors: ["purple"],
  targets: {
    types: ["agent"],
  },
  play: function* (target) {
    yield* util.modifyCard(cache, game, card, {
      target,
      modifier: {
        card,
        name: "Smoking",
      },
    });
  },
  modifiers: {
    Tribute: util.keywordModifier(["tribute", "agent"]),
    Smoking: (info, modifier, modifiedCard) => ({
      text: `${info.text} whenever this is exhausted, two random cards in your deck gain Tribute: Agent`,
      onExhaust: function* () {
        const cards = util.filter(cache, game, {
          players: [util.self(game, modifiedCard)],
          zones: ["deck"],
          excludes: [modifiedCard],
        });
        const deckards = util.randoms(cards, 2);
        yield* util.modifyCard(cache, game, modifiedCard, {
          target: deckards[0],
          modifier: {
            card: card,
            name: "Tribute",
          },
        });
        yield* util.modifyCard(cache, game, modifiedCard, {
          target: deckards[1],
          modifier: {
            card: card,
            name: "Tribute",
          },
        });
      },
    }),
  },
});
