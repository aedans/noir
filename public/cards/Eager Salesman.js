//ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, game, card) => ({
  type: "agent",
  text: "When this is revealed, your opponent gains $2.",
  cost: { money: 4 },
  colors: ["green"],
  onReveal: function* () {
    yield* util.addMoney(game, {
      player: util.opponent(game, card),
      money: 2,
    });
  },
});
