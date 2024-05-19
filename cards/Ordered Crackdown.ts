import type { PartialCardInfoComputation } from "../common/card";

export const card: PartialCardInfoComputation = (util, cache, game, card) => ({
  type: "operation",
  text: "Delay 2. Remove each of your opponent's revealed cards that cost $12 or less.",
  cost: { money: 8, agents: 4 },
  colors: ["blue"],
  play: function* () {
    yield util.enterCard({ source: card, target: card });
    yield util.setProp({ source: card, target: card, name: "turns", value: 2 });
  },
  turn: function* () {
    if (card.props.turns === 0) {
      const cards = util.filter(cache, game, {
        hidden: false,
        players: [util.opponent(game, card)],
        maxMoney: 12,
      });
      for (const card of cards) {
        yield util.removeCard({ source: card, target: card });
      }
      yield util.removeCard({ source: card, target: card });
      yield util.setProp({ source: card, target: card, name: "turns", value: undefined });
    } else {
      yield util.setProp({ source: card, target: card, name: "turns", value: card.props.turns - 1 });
    }
  },
});
