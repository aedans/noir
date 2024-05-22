import type { PartialCardInfoComputation } from "../common/card";

export const card: PartialCardInfoComputation = (util, cache, game, card) => ({
  text: "Gain $8.",
  type: "operation",
  cost: { money: 3, agents: 1 },
  keywords: [["delay", 2]],
  colors: ["green"],
  play: function* () {
    yield util.addMoney({ source: card, player: util.self(game, card), money: 8 });
  },
});
