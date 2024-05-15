// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  text: "[A]: gain $2.",
  type: "agent",
  cost: { money: 10 },
  keywords: [["disloyal"], ["protected"]],
  activate: function* () {
    yield util.addMoney({
      source: card,
      player: util.currentPlayer(game),
      money: 2,
    });
  },
});
