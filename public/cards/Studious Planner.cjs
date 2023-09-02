// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  text: "Activate this, [1]: your next operation costs $3 less.",
  type: "agent",
  cost: { money: 7 },
  colors: [],
  keywords: [["disloyal"], ["protected"]],
  activateCost: { agents: 1 },
  activate: function* () {
    yield* util.setProp(cache, game, card, { target: card, name: "studying", value: true });
  },
  effectFilter: {
    players: [util.self(game, card)],
    types: ["operation"],
    zones: ["deck"],
  },
  effect: (info, state) => {
    if (card.props.studying == true) {
      return {
        cost: { ...info.cost, money: info.cost.money - 3 },
        play: function* (target) {
          yield* util.setProp(cache, game, card, { target: card, name: "studying", value: false });
          yield* info.play(target);
        },
      };
    }
  },
});
