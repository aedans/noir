// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, game, card) => ({
  text: "Reveal and remove the last agent your opponent played.",
  type: "operation",
  cost: { money: 4, agents: 1 },
  colors: ["purple"],
  play: function* () {
    const action = game.history.find((action) => {
      if (action.type != "game/playCard" || !action.payload.target) {
        return false;
      }

      const { player, zone, index } = util.findCard(game, action.payload.target);
      const toRemove = game.players[player][zone][index];

      return player == util.opponent(game, card) && util.getCardInfo(game, toRemove).type == "agent";
    });

    if (!action || !action.payload.target) {
      throw "Your opponent has played no agents";
    }

    yield* util.revealCard(game, card, { target: action.payload.target });
    yield* util.removeCard(game, card, { target: action.payload.target });
  },
});
