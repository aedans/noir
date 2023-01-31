// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  text: "Choose one of your opponent's agents. It gains 'Whenever this is activated, you lose $2'.",
  type: "operation",
  cost: { money: 3 },
  colors: [],
  targets: {
    players: [util.opponent(game, card)],
    types: ["agent"],
  },
  play: function* (target) {
    yield* util.modifyCard(cache, game, card, {
      target,
      modifier: {
        card,
        name: "avaricious",
      },
    });
  },
  modifiers: {
    avaricious: (info) => ({
      text: `${info.text} Whenever this is activated, you lose $2.`,
      onExhaust: function* () {
        yield* util.removeMoney(cache, game, card, {
          player: util.findCard(game, card).player,
          money: 2,
        });
      },
    }),
  },
});
