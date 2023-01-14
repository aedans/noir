// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, game, card) => ({
  text: "Activate this and another agent: gain $3.",
  type: "agent",
  cost: { money: 8 },
  colors: [],
  activateCost: { agents: 1 },
  activate: function* () {
    yield* util.addMoney(game, {
      player: util.currentPlayer(game),
      money: 3,
    });
  }
});