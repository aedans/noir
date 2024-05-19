import type { PartialCardInfoComputation } from "../common/card";

export const card: PartialCardInfoComputation = (util, cache, game, card) => ({
  text: "Gain $13. At the end of your turn in your deck, reduce this card's cost by $1.",
  cost: { money: 11 - Math.trunc(game.turn / 2), agents: 1 },
  colors: ["green"],
  keywords: [["debt", 5]],
  type: "operation",
  play: function* () {
    yield util.addMoney({
      source: card,
      player: util.findCard(game, card).player,
      money: 13,
    });
  },
});
