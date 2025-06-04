import type { PartialCardInfoComputation } from "../common/card";

export const card: PartialCardInfoComputation = (util, cache, game, card) => ({
  text: "Every other turn: add a Random Citizen to your deck. It becomes purple.",
  type: "agent",
  cost: { money: 8 },
  colors: ["purple"],
  play: function* () {
    yield util.setProp({ source: card, target: card, name: "turns", value: 0 });
  },
  turn: function* () {
    yield util.setProp({ source: card, target: card, name: "turns", value: (card.props.turns + 1) % 2 });

    if (card.props.turns == 1) {
      const target = util.cid();
      const state = util.defaultCardState("Random Citizen", target.id);
      state.modifiers.push({ card, name: "purple", props: {} })
      yield util.addCard({
        source: card,
        target,
        state,
        player: util.findCard(game, card).player,
        zone: "deck",
      });
    }
  },
  modifiers: {
    purple: (info) => ({
      colors: ["purple"],
    }),
  },
});
