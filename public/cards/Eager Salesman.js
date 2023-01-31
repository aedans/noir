// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  type: "agent",
  text: "When this is revealed, your opponent gains $2.",
  cost: { money: 4 },
  colors: ["green"],
  onReveal: function* () {
    yield* util.addMoney(cache, game, card, {
      player: util.opponent(game, card),
      money: 2,
    });
  },
});
