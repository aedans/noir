import type { PartialCardInfoComputation } from "../common/card";

export const card: PartialCardInfoComputation = (util, cache, game, card) => ({
  text: "Remove an operation.",
  type: "operation",
  cost: { money: 2, agents: 1 },
  targets: {
    types: ["operation"],
    zones: ["deck", "board"],
    players: [util.opponent(game, card)],
  },
  play: function* (target) {
    yield util.removeCard({ source: card, target });
  },
});
