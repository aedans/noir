import type { PartialCardInfoComputation } from "../common/card";

export const card: PartialCardInfoComputation = (util, cache, game, card) => ({
  type: "agent",
  text: "Activate this, exhaust an agent: gain $12 and remove this.",
  cost: { money: 8 },
  colors: ["green"],
  activate: function* () {
    yield util.addMoney({
      source: card,
      player: util.self(game, card),
      money: 12,
    });
    yield util.removeCard({ source: card, target: card });
  },
});
