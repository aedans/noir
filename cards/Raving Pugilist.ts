import type { PartialCardInfoComputation } from "../common/card";

export const card: PartialCardInfoComputation = (util, cache, game, card) => ({
  text: "Every other turn: if your opponent has at least four revealed agents, remove one of them.",
  type: "agent",
  cost: { money: 8 },
  colors: ["orange"],
  play: function* () {
    yield util.setProp({ source: card, target: card, name: "turns", value: 0 });
  },
  turn: function* () {
    if (card.props.turns == 0) {
      yield util.setProp({ source: card, target: card, name: "turns", value: (card.props.turns + 1) % 2 });
    } else { 
      yield util.setProp({ source: card, target: card, name: "turns", value: 0 }) 
    };

    if (card.props.turns == 1) {
      if (
        util.filter(cache, game, {
          hidden: false,
          zones: ["board", "deck"],
          players: [util.opponent(game, card)],
          types: ["agent"],
        }).length >= 4
      ) {
        const cards = util.filter(cache, game, {
          hidden: false,
          zones: ["board", "deck"],
          players: [util.opponent(game, card)],
          types: ["agent"],
        });
        for (const target of util.randoms(cards, 1)) {
          yield util.removeCard({ source: card, target });
        }
      }
    }
  },
});
