// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  text: "Remove one of your opponent's agents. Return this to your deck next turn with $2 added to its cost. ",
  type: "operation",
  cost: { money: 11, agents: 1,
  },
  targets: {
    types: ["agent", "operation"],
  },
  play: function* (target) {
      yield* util.modifyCard(cache,game,card, {
        target: card,
        modifier: {
          card,
          name: "expensive"
        }
      })
      yield* util.removeCard(cache, game, card, { target });
      yield* util.bounceCard(cache, game, card, { target: card });
  },
  modifiers: {
    expensive: (info, modifier, card) => ({
      cost: {money: info.cost.money + 2, agents: 1}
    })
  }
});
