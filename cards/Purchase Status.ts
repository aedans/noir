import type { PartialCardInfoComputation } from "../common/card";

export const card: PartialCardInfoComputation = (util, cache, game, card) => ({
  text: "Choose an agent. It gains VIP and Protected.",
  type: "operation",
  cost: { money: 4, agents: 1 },
  colors: ["green"],
  targets: {
    players: [util.self(game, card)],
    types: ["agent"],
  },
  play: function* (target) {
    yield util.modifyCard({
      source: card,
      target,
      modifier: {
        card,
        name: "powerful",
      },
    });

    yield util.setProp({
      source: card,
      target,
      name: "protected",
      value: true,
    });
  },
  modifiers: {
    powerful: (info) => ({
      text: `${info.text} This is high status.`,
      keywords: [...info.keywords, ["vip"], ["protected"]],
    }),
  },
});
