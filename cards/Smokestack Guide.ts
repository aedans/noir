import type { PartialCardInfoComputation } from "../common/card";

export const card: PartialCardInfoComputation = (util, cache, game, card) => ({
  type: "agent",
  text: "When this enters, put a Random Citizen onto your board. It becomes orange.",
  cost: { money: 6, agents: 1 },
  colors: ["orange"],
  play: function* () {
    const target = util.cid();
    yield util.addCard({
      source: card,
      target,
      name: "Random Citizen",
      player: util.findCard(game, card).player,
      zone: "board",
    });

    yield util.modifyCard({ source: card, target, modifier: { card, name: "orange" } });
  },
  modifiers: {
    orange: (info, modifier, card) => ({
      colors: ["orange"],
    }),
  },
});
