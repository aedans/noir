// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  text: "Reveal and undo the last operation your opponent played.",
  type: "operation",
  cost: { money: 6, agents: 1 },
  colors: [],
  play: function* () {
    const action = game.history.find((action) => {
      if (action.type != "game/playCard" || !action.payload.target) {
        return false;
      }

      const { player, zone, index } = util.findCard(game, action.payload.target);
      const toUndo = game.players[player][zone][index];

      return player == util.opponent(game, card) && cache.getCardInfo(game, toUndo).type == "operation";
    });

    if (!action) {
      throw "Your opponent has played no operations";
    }

    const target = action.payload.target;

    if (target) {
      yield* util.revealCard(cache, game, card, { target });

      for (let index = 0; index < game.history.length; index++) {
        if (game.history[index].payload.source == target && game.history[index].type != "game/playCard") {
          yield* util.setUndone(game, { index });
        }
      }
    }
  },
});
