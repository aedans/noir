import type { PartialCardInfoComputation } from "../common/card";

export const card: PartialCardInfoComputation = (util, cache, game, card) => ({
  text: "Remove a card.",
  type: "operation",
  cost: { money: 8, agents: 1 },
  targets: {
    zones: ["board", "deck"],
  },
  play: function* (target) {
    yield util.removeCard({ source: card, target });
  },
});
