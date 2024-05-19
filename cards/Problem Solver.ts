import type { PartialCardInfoComputation } from "../common/card";

export const card: PartialCardInfoComputation = (util, cache, game, card) => ({
  type: "agent",
  text: "[A]: remove one of your opponent's cards. When one of your cards is removed, refresh this.",
  cost: { money: 12, agents: 2 },
  keywords: [["protected"]],
  colors: ["purple"],
  activateTargets: {
    zones: ["deck", "board"],
    types: ["agent", "operation"],
    players: [util.opponent(game, card)],
  },
  activate: function* (target) {
    yield util.removeCard({ source: card, target });
  },
  effectFilter: {
    players: [util.self(game, card)],
    types: ["agent"],
    zones: ["deck", "board"],
  },
  effect: (affectedInfo, affectedCard) => {
    return {
      onTarget: function* (action) {
        affectedInfo.onTarget(action);
        if (action.type == "game/removeCard") {
          yield util.refreshCard({ source: card, target: card });
        }
      },
    };
  },
});
