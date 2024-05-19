import type { PartialCardInfoComputation } from "../common/card";

export const card: PartialCardInfoComputation = (util, cache, game, card) => ({
  text: "Remove one of your opponent's agents. Return this to your deck next turn with $3 added to its cost. ",
  type: "operation",
  cost: { money: 10, agents: 1 },
  targets: {
    types: ["agent"],
    players: [util.opponent(game, card)],
    zones: ["board", "deck"],
  },
  play: function* (target) {
    yield util.modifyCard({
      source: card,
      target: card,
      modifier: {
        card,
        name: "expensive",
      },
    });
    yield util.removeCard({ source: card, target });
    yield util.bounceCard({ source: card, target: card });
  },
  modifiers: {
    expensive: (info, modifier, card) => ({
      cost: { money: info.cost.money + 3, agents: 1 },
    }),
  },
});
