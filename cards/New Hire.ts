import type { PartialCardInfoComputation } from "../common/card";

export const card: PartialCardInfoComputation = (util, cache, game, card) => ({
  type: "agent",
  cost: { money: 6 },
  text: "When this is removed, add a purple Random Citizen to your deck.",
  colors: ["purple"],
  onTarget: function* (action) {
    if (action.type == "game/removeCard") {
      const target = util.cid();
      const state = util.defaultCardState("Random Citizen", target.id);
      state.modifiers.push({ name: "purple", card, props: {} });
      yield util.addCard({
        source: card,
        target,
        state,
        player: util.self(game, card),
        zone: "deck",
      });
    }

    return false;
  },
  modifiers: {
    purple: (info) => ({
      colors: ["purple"],
    }),
  },
});
