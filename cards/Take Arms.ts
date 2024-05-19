import type { PartialCardInfoComputation } from "../common/card";

export const card: PartialCardInfoComputation = (util, cache, game, card) => ({
  text: "This costs a number of agents equal to the number of orange agents you have. Remove that many of your opponent's cards on board at random.",
  type: "operation",
  cost: {
    money: 10,
    agents: util.filter(cache, game, {
      players: [util.self(game, card)],
      types: ["agent"],
      zones: ["board"],
      colors: ["orange"],
      exhausted: false,
    }).length,
  },
  colors: ["orange"],
  play: function* () {
    const cards = util.filter(cache, game, {
      hidden: false,
      players: [util.opponent(game, card)],
      zones: ["board"],
    });
    for (const target of util.randoms(cards, this.cost?.agents ?? 0)) {
      yield util.removeCard({ source: card, target });
    }
  },
});
