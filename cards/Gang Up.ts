import type { PartialCardInfoComputation } from "../common/card";

export const card: PartialCardInfoComputation = (util, cache, game, card) => ({
  text: "Remove an agent on the board.",
  type: "operation",
  cost: { money: 1, agents: 3 },
  targets: {
    types: ["agent"],
    zones: ["board"],
  },
  play: function* (target) {
    yield util.removeCard({ source: card, target });
  },
  factor: "negative",
  evaluate: (ai, target) => ai.evaluateRemove(game, cache, target),
});