import type { PartialCardInfoComputation } from "../common/card";

export const card: PartialCardInfoComputation = (util, cache, game, card) => ({
  text: "Put a card on your opponent's board into their deck, then remove all your money. It costs that much more.",
  type: "operation",
  cost: { money: 0, agents: 1 },
  colors: ["green"],
  targets: {
    players: [util.opponent(game, card)],
    types: ["agent", "operation"],
    zones: ["board"],
  },
  play: function* (target) {
    yield util.modifyCard({
      source: card,
      target,
      modifier: {
        card,
        name: "harassed",
      },
    });

    const money = game.players[util.self(game, card)].money;
    yield util.setProp({ source: card, target, name: "harassed", value: money });
    yield util.removeMoney({ source: card, player: util.self(game, card), money });
    yield util.bounceCard({ source: card, target });
  },
  modifiers: {
    harassed: (info, modifier, card) => ({
      cost: { money: info.cost.money + card.props.harassed, agents: info.cost.agents },
    }),
  },
});
