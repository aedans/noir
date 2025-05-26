import type { PartialCardInfoComputation } from "../common/card";

export const card: PartialCardInfoComputation = (util, cache, game, card) => ({
  text: "When this is played or removed, reveal three cards.",
  type: "operation",
  colors: ["purple"],
  cost: { money: 3, agents: 1 },
  onTarget: function* (action) {
    if (action.type == "game/removeCard") {
      yield* util.revealRandom(cache, game, card, 3, {});
    }

    return false;
  },
  play: function* () {
    yield* util.revealRandom(cache, game, card, 3, {});
  },
});
