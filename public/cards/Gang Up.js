// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, game, card) => ({
    text: "Remove an agent on the board.",
    type: "operation",
    cost: { money: 2, agents: 3 } , 
    targets: () => util.filter(game, {
      types: ["agent"],
      zones: ["board"],
    }),
    play: function* (target) {
      yield* util.removeCard(game, { card: target });
    }
  });