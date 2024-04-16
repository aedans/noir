// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  text: "[A][E]: gain $2.",
  type: "agent",
  cost: { money: 7 },
  colors: [],
  activateCost: { agents: 1 },
  activate: function* () {
    yield* util.addMoney(cache, game, card, {
      player: util.currentPlayer(game),
      money: 2,
    });
  },
  evaluateActivate: () => [2, 0],
});
