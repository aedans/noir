// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, game, card) => ({
  text: "Reveal and undo the last operation your opponent played.",
  type: "operation",
  cost: { money: 6, agents: 1 },
  colors: [],
  play: function* () {
    const action = game.history.reverse().find((action) => {
      if (action.type != "game/playCard" || action.payload.target == undefined) {
        return false;
      }

      const card = util.getCard(game, action.payload.target);
      const { player } = util.findCard(game, card);

      return player == util.self(game, card) && util.getCardInfo(game, card).type == "operation";
    });

    if (action) {
      const target = action.payload.target;
      if (target) {
        yield* util.revealCard(game, card, { target });

        for (let index = 0; index < game.history.length; index++) {
          if (game.history[index].payload.source) {
            yield util.setUndone({ index });
          }
        }
      }
    }
  },
});
