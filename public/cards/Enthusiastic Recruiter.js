// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  type: "agent",
  cost: { money: 9 },
  text: "Whenever this is activated, your next agent this turn costs $3 less.",
  colors: ["orange"],
  effectFilter: {
    players: [util.self(game, card)],
    zones: ["deck"],
    types: ["agent"],
  },
  effect: (info, state) => {
    if (card.props.recruiting == true) {
      return {
        cost: { ...info.cost, money: info.cost.money - 3 },
        play: function* (target) {
          yield* util.setProp(cache, game, card, { target: card, name: "recruiting", value: false });
          yield* info.play(target);
        },
      };
    }
  },
  onExhaust: function* () {
    yield* util.setProp(cache, game, card, { target: card, name: "recruiting", value: true });
  },
  turn: function* () {
    yield* util.setProp(cache, game, card, { target: card, name: "recruiting", value: false });
  },
});
