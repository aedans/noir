// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  text: "The first agent you play each turn costs $2 less and exhausts this.",
  type: "agent",
  cost: { money: 5 },
  colors: [],
  keywords: [["disloyal"], ["protected"]],
  effectFilter: {
    players: [util.self(game, card)],
    types: ["agent"],
    zones: ["deck"],
  },
  effect: (info, state) => {
    if (!card.exhausted) {
      return {
        cost: { ...info.cost, money: info.cost.money - 2 },
        play: function* (target) {
          yield* util.exhaustCard(cache, game, card, { target: card });
          yield* info.play(target);
        },
      };
    }
  },
});
