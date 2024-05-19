import type { PartialCardInfoComputation } from "../common/card";

export const card: PartialCardInfoComputation = (util, cache, game, card) => ({
  text: "The next agent you play costs $7 less and gains Delay 2",
  type: "operation",
  cost: { money: 0, agents: 1 },
  colors: ["blue"],
  play: function* () {
    yield util.enterCard({ source: card, target: card });
  },
  effectFilter: {
    zones: ["deck"],
    players: [util.self(game, card)],
    types: ["agent"],
  },
  effect: (affectedInfo, affectedCard) => {
    return {
      cost: { money: affectedInfo.cost.money - 7, agents: affectedInfo.cost.agents },
      keywords: [...affectedInfo.keywords, ["delay", 2]],
      play: function* (target) {
        yield util.removeCard({ source: card, target: card });
        yield* affectedInfo.play(target);
      },
    };
  },
});
