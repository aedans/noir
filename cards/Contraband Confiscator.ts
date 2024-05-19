import type { PartialCardInfoComputation } from "../common/card";

export const card: PartialCardInfoComputation = (util, cache, game, card) => ({
  type: "agent",
  text: "[A][E]: remove an operation and gain $2.",
  cost: { money: 10 },
  colors: ["blue"],
  keywords: [["protected"]],
  activateCost: { agents: 1 },
  activateTargets: {
    types: ["operation"],
    zones: ["deck", "board"],
  },
  activate: function* (target) {
    yield util.removeCard({ source: card, target });
    yield util.addMoney({
      source: card,
      player: util.findCard(game, card).player,
      money: 2,
    });
  },
});
