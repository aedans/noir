import type { PartialCardInfoComputation } from "../common/card";

export const card: PartialCardInfoComputation = (util, cache, game, card) => ({
  text: "Undo the removal of your last removed card.",
  type: "operation",
  cost: { money: 5, agents: 2 },
  colors: [],
  play: function* () {
    const index = [...game.history].reverse().findIndex((action) => {
      if (action.type != "game/removeCard" || !action.payload.target) {
        return false;
      }

      const { player, zone, index } = util.findCard(game, action.payload.target);
      const toUndo = game.players[player][zone][index];

      return player == util.self(game, card);
    });

    if (index == 0) {
      throw "Your opponent has removed none of your agents";
    }

    // yield util.setUndone(game, { index });
  },
});
