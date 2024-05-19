import type { PartialCardInfoComputation } from "../common/card";

export const card: PartialCardInfoComputation = (util, cache, game, card) => ({
  text: "In two turns, gain $8.",
  type: "operation",
  cost: { money: 3, agents: 1 },
  colors: ["green"],
  play: function* () {
    yield util.enterCard({ source: card, target: card });
    yield util.setProp({ source: card, target: card, name: "turns", value: 2 });
  },
  turn: function* () {
    if (card.props.turns === 0) {
      yield util.addMoney({ source: card, player: util.self(game, card), money: 8 });
      yield util.removeCard({ source: card, target: card });
      yield util.setProp({ source: card, target: card, name: "turns", value: undefined });
    } else {
      yield util.setProp({ source: card, target: card, name: "turns", value: card.props.turns - 1 });
    }
  },
});
