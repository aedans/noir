// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  type: "agent",
  text: "When this is removed, reduce the cost of a random card in your deck by $4. It gains Debt 2.",
  cost: { money: 6 },
  colors: ["green"],
  onRemove: function* () {
    const cartas = util.filter(cache, game, {
      players: [util.self(game, card)],
      zones: ["deck"],
    });
    const radom = util.randoms(cartas, 1);
    yield* util.modifyCard(cache, game, card, {
      target: radom[0],
      modifier: {
        card,
        name: "cheaper",
      },
    });
  },
  modifiers: {
    cheaper: (info, modifier, card) => ({
      cost: { ...info.cost, money: info.cost.money - 4 },
      keywords: [["debt", 2]],
    }),
  },
});
