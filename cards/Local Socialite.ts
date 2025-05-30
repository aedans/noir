import type { PartialCardInfoComputation } from "../common/card";

export const card: PartialCardInfoComputation = (util, cache, game, card) => ({
  text: "Activate this, exhaust an agent: your next agent costs $1 less.",
  type: "agent",
  cost: { money: 4 },
  colors: [],
  keywords: [["disloyal"], ["protected"]],
  activate: function* () {
    yield util.setProp({ source: card, target: card, name: "socializing", value: true });
  },
  effectFilter: {
    players: [util.self(game, card)],
    types: ["agent"],
    zones: ["deck"],
  },
  effect: (info, state) => {
    if (card.props.socializing == true) {
      return {
        cost: { ...info.cost, money: info.cost.money - 1 },
        play: function* (target) {
          yield util.setProp({ source: card, target: card, name: "socializing", value: false });
          yield* info.play(target);
        },
      };
    }
  },
});
