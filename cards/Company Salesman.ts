import type { PartialCardInfoComputation } from "../common/card";

export const card: PartialCardInfoComputation = (util, cache, game, card) => ({
  type: "agent",
  text: "When this is removed, reduce the cost of a random card in your deck by $4. It gains Debt 2.",
  cost: { money: 6 },
  colors: ["green"],
  onTarget: function* (action) {
    if (action.type == "game/removeCard") {
      const cartas = util.filter(cache, game, {
        players: [util.self(game, card)],
        zones: ["deck"],
      });
      const radom = util.randoms(cartas, 1);
      yield util.modifyCard({
        source: card,
        target: radom[0],
        modifier: {
          card,
          name: "cheaper",
        },
      });  
    }

    return false;
  },
  modifiers: {
    cheaper: (info, modifier, card) => ({
      cost: { ...info.cost, money: info.cost.money - 4 },
      keywords: [["debt", 2]],
    }),
  },
});
