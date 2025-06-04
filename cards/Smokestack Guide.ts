import type { PartialCardInfoComputation } from "../common/card";

export const card: PartialCardInfoComputation = (util, cache, game, card) => ({
  type: "agent",
  text: "When this enters, put a Random Citizen onto your board. It becomes orange.",
  cost: { money: 6, agents: 1 },
  colors: ["orange"],
  play: function* () {
    const target = util.cid();
    const state = util.defaultCardState("Random Citizen", target.id);
    state.modifiers.push({ card, name: "orange", props: {} });
    yield util.addCard({
      source: card,
      target,
      state,
      player: util.findCard(game, card).player,
      zone: "board",
    });
  },
  modifiers: {
    orange: (info, modifier, card) => ({
      colors: ["orange"],
    }),
  },
});
