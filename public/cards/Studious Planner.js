// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  text: "Your first operation each turn costs $3 less and exhausts this.",
  type: "agent",
  cost: { money: 8 },
  colors: [],
  keywords: [["disloyal"], ["protected"]],
  effectFilter: {
    players: [util.self(game, card)],
    types: ["operation"],
    zones: ["deck"],
  },
  effect: (info, state) => {
    if (!card.exhausted) {
      return {
        cost: { ...info.cost, money: info.cost.money - 3 },
        play: function* (target) {
          yield* util.exhaustCard(cache, game, card, { target: card });
          yield* info.play(target);
        },
      };
    }
  },
});
