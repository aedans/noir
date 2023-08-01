// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  type: "agent",
  text: "This is all colors. When you play a card, this loses that card's colors at the end of your turn.",
  cost: { money: 5 },
  colors: card.props.colors ?? ["green", "blue", "orange", "purple"],
  keywords: [["disloyal"]],
  onPlay: function* () {
    yield* util.setProp(cache, game, card, {
      target: card,
      name: "colors",
      value: ["green", "orange", "blue", "purple"],
    });
  },
  onExhaust: function* (action) {
    if (action.source) {
      const remcol = util.getCard(game, action.source);
      const remcoll = cache.getCardInfo(game, remcol).colors;
      yield* util.setProp(cache, game, card, {
        target: card,
        name: "colors",
        value: card.props.colors.filter((jeb) => jeb != remcoll),
      });
    }
  },
  /* copypasted from bearer of lanterns 
  effectFilter: {
    players: [util.self(game, card)],
    zones: ["deck"],
    types: ["operation"],
  },
  effect: (info, state) => {
    if (card.props.lit == true) {
      return {
        onPlay: function* (action) {
          yield* info.onPlay(action);
          const numberToReveal = cache.getCardInfo(game, state).colors.includes("blue") ? 2 : 1;
          yield* util.revealRandom(cache, game, card, numberToReveal);
          yield* util.setProp(cache, game, card, { target: card, name: "lit", value: false });
        },
      };
    }
  },
  */
});
