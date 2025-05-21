import type { PartialCardInfoComputation } from "../common/card";

export const card: PartialCardInfoComputation = (util, cache, game, card) => ({
  type: "agent",
  text: "Activate this, exhaust two agents: remove an agent.",
  cost: { money: 12 },
  colors: ["blue"],
  keywords: [["protected"], ["delay", 1]],
  activateCost: { agents: 1 },
  activateTargets: {
    zones: ["board", "deck"],
    types: ["agent"],
  },
  activate: function* (target) {
    yield util.removeCard({ source: card, target });
  },
});
