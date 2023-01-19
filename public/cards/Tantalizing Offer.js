//ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, game, card) => ({
    text: "Steal an agent and put it revealed onto your board.",
    type: "operation",
    cost: { money: 16, agents: 1 },
    colors: ["green"],
    targets: {
      players: [util.opponent(game, card)],
      types: ["agent"],
    },
    play: function*(target){
        yield* util.stealCard(game, { card: target, zone: "board" })
    }
  });