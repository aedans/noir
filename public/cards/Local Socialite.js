// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, game, card) => ({
    text: "The first agent you play each turn costs $1 less and exhausts this.",
    type: "agent",
    cost: { money: 4 },
    colors: [],
    keywords: ["disloyal", "protected"],
    effectFilter: {
      players: [util.self(game, card)],
      types: ["agent"],
      zones: ["deck"],
    },
    effect: (info, state) => {
      if (!card.exhausted) {
        return {
          cost: { ...info.cost, money: info.cost.money - 1 },
          play: function* (target) {
            yield* util.exhaustCard(game, card, { target: card });
            yield* info.play(target);
          }
        }
      }
    }
  });