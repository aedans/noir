// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  type: "agent",
  text: "This is all colors. When you play a card, this loses that card's colors at the end of your turn.",
  cost: { money: 5 },
  colors: card.props.colors ?? ["green", "blue", "orange", "purple"],
  keywords: [["disloyal"]],
  play: function* () {
    yield util.setProp({
      source: card,
      target: card,
      name: "colors",
      value: ["green", "orange", "blue", "purple"],
    });
  },
  turn: function* () {
    if (card.props.colortemp) {
      yield util.setProp({
        source: card,
        target: card,
        name: "colors",
        value: card.props.colortemp,
      });
      yield util.setProp({
        source: card,
        target: card,
        name: "colortemp",
        value: null,
      });
    }
  },
  effectFilter: {
    players: [util.self(game, card)],
    zones: ["deck"],
  },
  effect: (affectedInfo, affectedCard) => {
    return {
      play: function* (action) {
        yield* affectedInfo.play(action);
        const remcol = util.getCard(game, affectedCard);
        const remcoll = cache.getCardInfo(game, remcol).colors;
        if (card.props.colortemp) {
          yield util.setProp({
            source: card,
            target: card,
            name: "colortemp",
            value: card.props.colortemp.filter((jeb) => jeb != remcoll),
          });
        } else {
          yield util.setProp({
            source: card,
            target: card,
            name: "colortemp",
            value: card.props.colors.filter((jeb) => jeb != remcoll),
          });
        }
      },
    };
  },
});
