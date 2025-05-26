import type { PartialCardInfoComputation } from "../common/card";

export const card: PartialCardInfoComputation = (util, cache, game, card) => ({
  text: "Activate this, exhaust an agent: gain $2.",
  type: "agent",
  cost: { money: 10 },
  keywords: [["disloyal"], ["protected"]],
  activate: function* () {
    yield util.addMoney({
      source: card,
      player: util.self(game, card),
      money: 2,
    });
  },
});
