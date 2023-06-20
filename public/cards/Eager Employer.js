// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  text: "Exhaust this and another agent: gain $3.",
  type: "agent",
  cost: { money: 8 },
  colors: [],
  activateCost: { agents: 1 },
  activate: function* () {
    yield* util.addMoney(cache, game, card, {
      player: util.currentPlayer(game),
      money: 3,
    });
  },
});
