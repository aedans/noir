import type { PartialCardInfoComputation } from "../common/card";

export const card: PartialCardInfoComputation = (util, cache, game, card) => ({
  text: "Steal one of your opponent's agents that costs $9 or less, putting it into your deck. It becomes purple and gains Disloyal.",
  type: "operation",
  cost: { money: 8, agents: 1 },
  colors: ["purple"],
  targets: {
    types: ["agent"],
    players: [util.opponent(game, card)],
    maxMoney: 9,
  },
  play: function* (target) {
    yield util.modifyCard({
      source: card,
      target,
      modifier: {
        card,
        name: "disloyal",
      },
    });
    yield util.stealCard({ source: card, target, zone: "deck" });
  },
  modifiers: {
    disloyal: (info, modifier, card) => ({
      keywords: [["disloyal"]],
      colors: ["purple"],
    }),
  },
});
