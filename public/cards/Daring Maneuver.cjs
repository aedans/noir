// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  text: "Undo the removal of your last removed agent.",
  type: "operation",
  cost: { money: 4, agents: 1 },
  colors: [],
  play: function* () {
    const index = game.history.findIndex((action) => {
      if (action.type != "game/removeCard" || !action.payload.target) {
        return false;
      }

      const { player, zone, index } = util.findCard(game, action.payload.target);
      const toUndo = game.players[player][zone][index];

      return player == util.self(game, card) && cache.getCardInfo(game, toUndo).type == "agent";
    });

    if (index == 0) {
      throw "Your opponent has removed none of your agents";
    }

    yield util.setUndone(game, { index });
  },
});
