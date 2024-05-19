import type { PartialCardInfoComputation } from "../common/card";

export const card: PartialCardInfoComputation = (util, cache, game, card) => ({
  text: "Choose a card on the board. It is returned to deck.",
  type: "operation",
  cost: { money: 3, agents: 1 },
  targets: {
    types: ["agent", "operation"],
    zones: ["board"],
  },
  play: function* (target) {
    yield util.bounceCard({ source: card, target });
  },
});
