// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
    text: "Remove an agent. At the end of your turn, this card's cost increases by $1.",
    cost: { money: 3 + Math.trunc(game.turn / 2), agents: 1 },
    colors: ["green"],
    type: "operation",
    targets: {
        types: ["agent"],
    },
    play: function* (target) {
        yield* util.removeCard(cache, game, card, { target });
    },
  });