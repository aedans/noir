import type { PartialCardInfoComputation } from "../common/card";

export const card: PartialCardInfoComputation = (util, cache, game, card) => ({
  text: "Gain $1.",
  type: "operation",
  play: function* () {
    yield util.addMoney({
      source: card,
      player: util.findCard(game, card).player,
      money: 1,
    });
  },
});
