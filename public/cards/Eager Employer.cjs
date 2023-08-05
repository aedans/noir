// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  text: "Activate this, exhaust two agents: gain $2.",
  type: "agent",
  cost: { money: 7 },
  colors: [],
  activateCost: { agents: 2 },
  activate: function* () {
    yield* util.addMoney(cache, game, card, {
      player: util.currentPlayer(game),
      money: 2,
    });
  },
});
