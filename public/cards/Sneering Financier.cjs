// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  type: "agent",
  text: "Exhaust this: give a card in a player's deck Debt 3. If it's in your deck, also reduce that card's cost by 3.",
  cost: { money: 10 },
  colors: ["green"],
  activateTargets: {
    zones: ["deck"],
  },
  activateCost: { agents: 1 },
  activate: function* (target) {
    const indebt = util.getCard(game, target);
    const debtplayer = util.findCard(game, indebt).player;
    if (debtplayer == util.self(game, card)) {
      yield* util.modifyCard(cache, game, card, {
        target,
        modifier: {
          card,
          name: "mydebt",
        },
      });
    } else {
      yield* util.modifyCard(cache, game, card, {
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
      keywords: [["debt", 3], ...info.keywords],
      cost: { money: info.cost.money - 3, agents: info.cost.agents },
    }),
    yourdebt: (info, modifier, card) => ({
      keywords: [["debt", 3], ...info.keywords],
    }),
  },
});
