// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, game, card) => ({
    text: "Your first operation each turn costs $2 less and exhausts this.",
    type: "agent",
    cost: { money: 7 },
    colors: [],
    keywords: ["disloyal", "protected"],
    turn: function* () {
      yield* util.setProp(game, card, { target: card, name: "ready", value: true });
    },
    effectFilter: {
      players: [util.self(game, card)],
      types: ["operation"],
      zones: ["deck"],
    },
    effect: (info, state) => {
      if (card.props.ready) {
        return {
          cost: { ...info.cost, money: info.cost.money - 2 },
          play: function* (target) {
            yield* util.setProp(game, card, { target: card, name: "ready", value: false });
            yield* info.play(target);
          }
        }
      }
    }
  });