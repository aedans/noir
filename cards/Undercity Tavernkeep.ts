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
      yield util.addCard({
        source: card,
        target,
        name: "Random Citizen",
        player: util.findCard(game, card).player,
        zone: "deck",
      });

      yield util.modifyCard({ source: card, target, modifier: { card, name: "purple" } });
    }
  },
  modifiers: {
    purple: (info) => ({
      colors: ["purple"],
    }),
  },
});
