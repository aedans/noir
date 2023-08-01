// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  text: "The next agent you play costs $6 less and gains Delay 1",
  type: "operation",
  cost: { money: 0, agents: 2 },
  colors: ["blue"],
  onPlay: function* () {
    yield* util.enterCard(cache, game, card, { target: card });
  },
  effectFilter: {
    zones: ["deck"],
    players: [util.self(game, card)],
    types: ["agent"],
  },
  effect: (affectedInfo, affectedCard) => {
    return {
      cost: { money: affectedInfo.cost.money - 6, agents: affectedInfo.cost.agents },
      keywords: [...affectedInfo.keywords, ["delay", 1]],
      play: function* (target) {
        yield* util.removeCard(cache, game, card, { target: card });
        yield* affectedInfo.play(target);
      },
    };
  },
});
