// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  text: "Reveal and remove the last agent your opponent played.",
  type: "operation",
  cost: { money: 5, agents: 1 },
  colors: ["purple"],
  play: function* () {
    const action = game.history.find((action) => {
      if (action.type != "game/playCard" || !action.payload.target) {
        return false;
      }

      const { player } = util.getCard(game, action.payload.target);

      return (
        player == util.opponent(game, card) &&
        cache.getCardInfo(game, util.getCard(game, action.payload.target)).type == "agent"
      );
    });

    if (!action || !action.payload.target) {
      throw "Your opponent has played no agents";
    }

    yield* util.revealCard(cache, game, card, { target: action.payload.target });
    yield* util.removeCard(cache, game, card, { target: action.payload.target });
  },
});
