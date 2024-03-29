// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  type: "agent",
  text: "When this is removed on board, double the cost of a random card in your deck.",
  cost: { money: 4 },
  colors: ["orange"],
  onRemove: function* () {
    const yourcards = util.filter(cache, game, {
      players: [util.self(game, card)],
      zones: ["deck"],
    });
    const fired = util.randoms(yourcards, 2);
    if (util.findCard(game, card).zone == "board") {
      yield* util.modifyCard(cache, game, card, { target: fired[0], modifier: { name: "expensive", card } });
    }
  },
  modifiers: {
    expensive: (info, modifier, card) => ({
      cost: { ...info.cost, money: info.cost.money * 2 },
    }),
  },
});
