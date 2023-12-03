// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  text: "Activate this, [1]: your next agent costs $1 less.",
  type: "agent",
  cost: { money: 4 },
  colors: [],
  keywords: [["disloyal"], ["protected"]],
  activateCost: { agents: 1 },
  activate: function* () {
    yield* util.setProp(cache, game, card, { target: card, name: "socializing", value: true });
  },
  evaluateActivate: () => [1, 0],
  effectFilter: {
    players: [util.self(game, card)],
    types: ["agent"],
    zones: ["deck"],
  },
  effect: (info, state) => {
    if (card.props.socializing == true) {
      return {
        cost: { ...info.cost, money: info.cost.money - 1 },
        play: function* (target) {
          yield* util.setProp(cache, game, card, { target: card, name: "socializing", value: false });
          yield* info.play(target);
        },
      };
    }
  },
});
