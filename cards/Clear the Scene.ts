import type { PartialCardInfoComputation } from "../common/card";

export const card: PartialCardInfoComputation = (util, cache, game, card) => ({
  type: "operation",
  text: "Target card loses Delay, Debt, Depart, and Tribute",
  cost: { money: 2, agents: 1 },
  targets: {},
  play: function* (target) {
    yield util.modifyCard({ source: card, target, modifier: { name: "cleared", card } });
  },
  modifiers: {
    cleared: (info) => ({
      keywords: info.keywords.filter(([name]) => !["delay", "debt", "depart", "tribute"].includes(name)),
    }),
  },
});
