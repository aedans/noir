import type { PartialCardInfoComputation } from "../common/card";

export const card: PartialCardInfoComputation = (util, cache, game, card) => ({
  text: "Choose one of your opponent's agents. It becomes colorless and gains Disloyal.",
  type: "operation",
  cost: { money: 3, agents: 1 },
  colors: [],
  targets: {
    players: [util.opponent(game, card)],
    types: ["agent"],
  },
  play: function* (target) {
    yield util.modifyCard({
      source: card,
      target,
      modifier: {
        card,
        name: "spooked",
      },
    });
  },
  modifiers: {
    spooked: (info) => ({
      text: `${info.text} This is spooked.`,
      keywords: [...info.keywords, ["disloyal"]],
      colors: [],
    }),
  },
});
