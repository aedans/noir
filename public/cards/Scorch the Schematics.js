// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
    text: "Remove an operation in your opponent's deck.",
    type: "operation",
    cost: { money: 2, agents: 1 },
    targets: {
      types: ["operation"],
      zones: ["deck"],
      players: [util.opponent(game,card)]
    },
    play: function* (target) {
      yield* util.removeCard(cache, game, card, { target });
    },
  });
  