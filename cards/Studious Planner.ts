import type { PartialCardInfoComputation } from "../common/card";

export const card: PartialCardInfoComputation = (util, cache, game, card) => ({
  text: "[A]: your next operation costs $3 less.",
  type: "agent",
  cost: { money: 7 },
  colors: [],
  keywords: [["disloyal"], ["protected"]],
  activate: function* () {
    yield util.setProp({ source: card, target: card, name: "studying", value: true });
  },
  effectFilter: {
    players: [util.self(game, card)],
    types: ["operation"],
    zones: ["deck"],
  },
  effect: (info, state) => {
    if (card.props.studying == true) {
      return {
        cost: { ...info.cost, money: info.cost.money - 3 },
        play: function* (target) {
          yield util.setProp({ source: card, target: card, name: "studying", value: false });
          yield* info.play(target);
        },
      };
    }
  },
});
