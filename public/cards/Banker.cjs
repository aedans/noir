// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  text: "Activate this, [1]: gain $2.",
  type: "agent",
  cost: { money: 10 },
  keywords: [["disloyal"], ["protected"]],
  activateCost: { agents: 1 },
  activate: function* () {
    yield* util.addMoney(cache, game, card, {
      player: util.currentPlayer(game),
      money: 2,
    });
  },
});
