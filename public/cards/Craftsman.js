// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, game, card) => ({
  text: "The first card you play each turn costs $2 less.",
  type: "agent",
  cost: { money: 9 },
  colors: [],
  keywords: ["disloyal", "protected"],
  turn: function* () {
    yield* util.setProp(game, card, { target: card, name: "ready", value: true });
  },
  effectFilter: {
    players: [util.self(game, card)],
    zones: ["deck"],
  },
  effect: (info, state) => {
    if (card.props.ready) {
      return {
        cost: { ...info.cost, money: info.cost.money - 2 },
        play: function* (target) {
          yield* util.setProp(game, card, { target: card, name: "ready", value: false });
          yield* info.play(target);
        },
      };
    }
  },
});
