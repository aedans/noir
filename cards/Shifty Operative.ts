import type { PartialCardInfoComputation } from "../common/card";

export const card: PartialCardInfoComputation = (util, cache, game, card) => ({
  text: "When this is removed while on your board, two cards in your deck gain Tribute.",
  type: "agent",
  cost: { money: 4 },
  colors: ["purple"],
  onTarget: function* (action) {
    if (action.type == "game/removeCard") {
      const cards = util.filter(cache, game, {
        players: [util.self(game, card)],
        colors: ["purple"],
        zones: ["deck"],
        excludes: [card],
      });
      const punger = util.randoms(cards, 2);
      if (util.findCard(game, card).zone == "board") {
        yield util.modifyCard({
          source: card,
          target: punger[0],
          modifier: {
            card,
            name: "Tribute",
          },
        });
        yield util.modifyCard({
          source: card,
          target: punger[1],
          modifier: {
            card,
            name: "Tribute",
          },
        });
      }  
    }
  },
  modifiers: {
    Tribute: util.keywordModifier(["tribute", "agent"]),
  },
});
