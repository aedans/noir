// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  type: "agent",
  text: "When this is revealed on the board, gain $1.",
  cost: { money: 6 },
  colors: ["green"],
  onReveal: function* () {
    yield* util.addMoney(cache, game, card, {
      player: util.self(game, card),
      money: 1,
    });
  },
});
