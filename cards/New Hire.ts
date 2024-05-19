import type { PartialCardInfoComputation } from "../common/card";

export const card: PartialCardInfoComputation = (util, cache, game, card) => ({
  type: "agent",
  cost: { money: 6 },
  text: "When this is removed, add a purple Random Citizen to your deck.",
  colors: ["purple"],
  onTarget: function* (action) {
    if (action.type == "game/removeCard") {
      const target = util.cid();
      yield util.addCard({
        source: card,
        target,
        name: "Random Citizen",
        player: util.self(game, card),
        zone: "deck",
      });

      yield util.modifyCard({
        source: card,
        target,
        modifier: {
          name: "purple",
          card,
        },
      });
    }
  },
  modifiers: {
    purple: (info) => ({
      colors: ["purple"],
    }),
  },
});
