import type { PartialCardInfoComputation } from "../common/card";

export const card: PartialCardInfoComputation = (util, cache, game, card) => ({
  text: "Steal an operation and put it hidden into your deck.",
  type: "operation",
  cost: { money: 0, agents: 1 },
  colors: ["purple"],
  keywords: [["tribute", "card"]],
  targets: {
    players: [util.opponent(game, card)],
    types: ["operation"],
  },
  play: function* (target) {
    yield util.modifyCard({
      source: card,
      target,
      modifier: {
        card,
        name: "porple",
      },
    });
    yield util.stealCard({ source: card, target, zone: "deck" });
  },
  modifiers: {
    porple: (info, modifier, card) => ({
      colors: ["purple"],
    }),
  },
});
