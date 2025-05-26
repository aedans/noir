import type { PartialCardInfoComputation } from "../common/card";

export const card: PartialCardInfoComputation = (util, cache, game, card) => ({
  type: "agent",
  text: "This costs $2 less for each of your opponent's revealed cards. Whenever one of your opponent's cards is revealed, add a copy to your deck.",
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
        if (action.type == "game/revealCard") {
          const name = util.getCard(game, affectedCard).name;
          const player = util.self(game, card);
          if (util.opponent(game, action.payload.target) == player) {
            yield util.addCard({
              source: card,
              target: util.cid(),
              name: name,
              player: player,
              zone: "deck",
            });
          }
        }

        return yield* affectedInfo.onTarget(action);
      },
    };
  },
});
