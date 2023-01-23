// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, game, card) => ({
  text: "Undo the removal of your last removed agent.",
  type: "operation",
  cost: { money: 4, agents: 1 },
  colors: [],
  play: function* () {
    const index = game.history
      .reverse()
      .findIndex(
        (action) =>
          action.type == "game/removeCard" &&
          action.payload.target &&
          util.getCardInfo(game, util.getCard(game, action.payload.target)).type == "agent"
      );

    if (index >= 0) {
      yield util.setUndone({ index });
    }
  },
});
