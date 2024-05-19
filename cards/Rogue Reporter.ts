import type { PartialCardInfoComputation } from "../common/card";

export const card: PartialCardInfoComputation = (util, cache, game, card) => ({
  text: "Each turn, reveal the highest cost hidden card.",
  type: "agent",
  cost: { money: 10 },
  keywords: [["disloyal"], ["protected"]],
  turn: function* () {
    const cards = util.filter(cache, game, {
      hidden: true,
      ordering: ["money"],
      reversed: true,
      zones: ["board", "deck"],
    });

    if (cards.length > 0) {
      const { player, zone } = util.findCard(game, cards[0]);
      yield util.revealCard({ source: card, target: cards[0], player, zone });
    }
  },
});
