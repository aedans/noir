import type { PartialCardInfoComputation } from "../common/card";

export const card: PartialCardInfoComputation = (util, cache, game, card) => ({
  type: "agent",
  text: "This costs $2 less for each of your opponent's revealed cards. Whenever you reveal one of your opponent's cards, add a copy to your deck.",
  keywords: [["vip"]],
  cost: {
    money:
      24 -
      2 *
        util.filter(cache, game, {
          players: [util.opponent(game, card)],
          hidden: false,
        }).length,
  },
  effectFilter: {
    players: [util.opponent(game, card)],
    hidden: true,
  },
  effect: (affectedInfo, affectedCard) => {
    return {
      onTarget: function* (action) {
        affectedInfo.onTarget(action);
        if (action.type == "game/revealCard") {
          const nombre = util.getCard(game, affectedCard).name;
          if (util.currentPlayer(game) == util.self(game, card)) {
            yield util.addCard({
              source: card,
              target: util.cid(),
              name: nombre,
              player: util.currentPlayer(game),
              zone: "deck",
            });
          }
        }
      },
    };
  },
});
