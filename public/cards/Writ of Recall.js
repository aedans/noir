// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
    text: "Choose a card on your opponent's board. It is put back into their deck.",
    type: "operation",
    cost: { money: 2, agents: 1 },
    targets: {
      types: ["agent", "operation"],
    },
    play: function* (target) {
      yield* util.bounceCard(cache, game, card, { target });
    },
})