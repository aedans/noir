import type { PartialCardInfoComputation } from "../common/card";

export const card: PartialCardInfoComputation = (util, cache, game, card) => ({
  type: "agent",
  text: "Activate this, exhaust an agent: give a card in a player's deck Debt 4. If it's in your deck, also reduce that card's cost by 4.",
  cost: { money: 10, agents: 1 },
  colors: ["green"],
  activateTargets: {
    zones: ["deck"],
  },
  activate: function* (target) {
    const indebt = util.getCard(game, target);
    const debtplayer = util.findCard(game, indebt).player;
    if (debtplayer == util.self(game, card)) {
      yield util.modifyCard({
        source: card,
        target,
        modifier: {
          card,
          name: "mydebt",
        },
      });
    } else {
      yield util.modifyCard({
        source: card,
        target,
        modifier: {
          card,
          name: "yourdebt",
        },
      });
    }
  },
  modifiers: {
    mydebt: (info, modifier, card) => ({
      keywords: [["debt", 4], ...info.keywords],
      cost: { money: info.cost.money - 4, agents: info.cost.agents },
    }),
    yourdebt: (info, modifier, card) => ({
      keywords: [["debt", 4], ...info.keywords],
    }),
  },
});
