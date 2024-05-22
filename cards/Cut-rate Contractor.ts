import type { PartialCardInfoComputation } from "../common/card";

export const card: PartialCardInfoComputation = (util, cache, game, card) => ({
  type: "agent",
  text: "When this is removed on board, double the cost of a random card in your deck.",
  cost: { money: 4 },
  colors: ["orange"],
  onTarget: function* (action) {
    if (action.type == "game/removeCard") {
      const yourcards = util.filter(cache, game, {
        players: [util.self(game, card)],
        zones: ["deck"],
      });
      const fired = util.randoms(yourcards, 2);
      if (util.findCard(game, card).zone == "board") {
        yield util.modifyCard({ source: card, target: fired[0], modifier: { name: "expensive", card } });
      }  
    }

    return false;
  },
  modifiers: {
    expensive: (info, modifier, card) => ({
      cost: { ...info.cost, money: info.cost.money * 2 },
    }),
  },
});
