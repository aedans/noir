import type { PartialCardInfoComputation } from "../common/card";

export const card: PartialCardInfoComputation = (util, cache, game, card) => ({
  type: "agent",
  text: "Exhaust three agents: remove a card.",
  cost: { money: 16 },
  keywords: [["disloyal"], ["protected"]],
  activateCost: { agents: 3 },
  activateTargets: {
    zones: ["board", "deck"],
  },
  activate: function* (target) {
    yield util.removeCard({ source: card, target });
  },
  evaluate: () => ({ value: 0 }),
  evaluateActivate: (ai) => util.bestTarget(ai, cache, game, card, { players: [util.opponent(game, card)] }),
});
