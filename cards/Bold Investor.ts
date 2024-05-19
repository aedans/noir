import type { PartialCardInfoComputation } from "../common/card";

export const card: PartialCardInfoComputation = (util, cache, game, card) => ({
  type: "agent",
  text: "[A]: gain $12 and remove this.",
  cost: { money: 8 },
  colors: ["green"],
  activate: function* () {
    yield util.addMoney({
      source: card,
      player: util.currentPlayer(game),
      money: 12,
    });
    yield util.removeCard({ source: card, target: card });
  },
});
