import type { PartialCardInfoComputation } from "../common/card";

export const card: PartialCardInfoComputation = (util, cache, game, card) => ({
  type: "agent",
  text: "[A]: steal an agent from your opponent, putting it onto your board. It gains Disloyal.",
  cost: { money: 30, agents: 1 },
  colors: ["green"],
  keywords: [["vip"]],
  activateTargets: {
    zones: ["deck", "board"],
    types: ["agent"],
  },
  activate: function* (target) {
    yield util.stealCard({ source: card, target, zone: "board" });
    yield util.modifyCard({
      source: card,
      target,
      modifier: {
        card,
        name: "disloyal",
      },
    });
  },
  modifiers: {
    disloyal: (info, modifier, card) => ({
      keywords: [["disloyal"]],
    }),
  },
});
