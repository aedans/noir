import type { PartialCardInfoComputation } from "../common/card";

export const card: PartialCardInfoComputation = (util, cache, game, card) => ({
  text: "When you play or Tribute this, reveal three cards.",
  type: "operation",
  colors: ["purple"],
  cost: { money: 3, agents: 1 },
  onTarget: function* (action) {
    if (action.type == "game/removeCard") {
      if (util.currentPlayer(game) == util.self(game, card)) {
        yield* util.revealRandom(cache, game, card, 3, {});
      }  
    }
  },
  play: function* () {
    yield* util.revealRandom(cache, game, card, 3, {});
  },
});
