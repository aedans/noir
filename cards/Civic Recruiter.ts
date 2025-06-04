import type { PartialCardInfoComputation } from "../common/card";

export const card: PartialCardInfoComputation = (util, cache, game, card) => ({
  text: "Every other turn: gain a Random Citizen. It becomes blue.",
  type: "agent",
  cost: { money: 10 },
  colors: ["blue"],
  play: function* () {
    yield util.setProp({ source: card, target: card, name: "turns", value: 0 });
  },
  turn: function* () {
    yield util.setProp({ source: card, target: card, name: "turns", value: (card.props.turns + 1) % 2 });

    if (card.props.turns == 0) {
      const target = util.cid();
      yield util.addCard({
        source: card,
        target,
        state: util.defaultCardState("Random Citizen", target.id),
        player: util.findCard(game, card).player,
        zone: "board",
      });

      yield util.modifyCard({ source: card, target, modifier: { card, name: "disloyalblue" } });
    }
  },
  modifiers: {
    disloyalblue: (info) => ({
      keywords: [["disloyal"]],
      colors: ["blue"],
    }),
  },
});
