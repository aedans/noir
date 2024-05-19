import type { PartialCardInfoComputation } from "../common/card";

export const card: PartialCardInfoComputation = (util, cache, game, card) => ({
  type: "agent",
  text: "[A]: remove the highest cost card each in your opponent's deck and board.",
  cost: { money: 36 },
  keywords: [["vip"], ["protected"]],
  activate: function* () {
    const deckstuff = util.filter(cache, game, {
      hidden: false,
      players: [util.opponent(game, card)],
      ordering: ["money"],
      reversed: true,
      zones: ["deck"],
    });
    if (deckstuff.length > 0) {
      yield util.removeCard({ source: card, target: deckstuff[0] });
    }
    const boardstuff = util.filter(cache, game, {
      hidden: false,
      players: [util.opponent(game, card)],
      ordering: ["money"],
      reversed: true,
      zones: ["board"],
    });
    if (boardstuff.length > 0) {
      yield util.removeCard({ source: card, target: boardstuff[0] });
    }
  },
});
