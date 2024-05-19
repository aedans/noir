import type { PartialCardInfoComputation } from "../common/card";

export const card: PartialCardInfoComputation = (util, cache, game, card) => ({
  text: "[A]: gain $1.",
  type: "agent",
  cost: { money: 5 },
  keywords: [["disloyal"], ["protected"]],
  activate: function* () {
    yield util.addMoney({
      source: card,
      player: util.currentPlayer(game),
      money: 1,
    });
  },
});
