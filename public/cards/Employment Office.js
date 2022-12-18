// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, game, card) => ({
  text: "Activate this and an agent: gain $15.",
  type: "location",
  cost: { money: 40 },
  colors: [],
  activateCost: { agents: 1 },
  activate: function* () {
    yield util.addMoney({
      player: util.currentPlayer(game),
      money: 15,
    });
  }
});