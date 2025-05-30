import type { PartialCardInfoComputation } from "../common/card";

export const card: PartialCardInfoComputation = (util, cache, game, card) => ({
  type: "agent",
  text: "Activate this, exhaust an agent: refresh your other agents. This can only be activated once each turn.",
  cost: { money: 9 },
  turn: function* () {
    yield util.setProp({
      source: card,
      target: card,
      name: "up",
      value: 1,
    });
  },
  activate: function* () {
    if (card.props.up == 1) {
      yield util.setProp({
        source: card,
        target: card,
        name: "up",
        value: 0,
      });
      const activatos = util.filter(cache, game, {
        players: [util.self(game, card)],
        zones: ["board"],
        types: ["agent"],
        excludes: [card],
        hasActivate: true,
      });
      const agentos = util.filter(cache, game, {
        players: [util.self(game, card)],
        zones: ["board"],
        types: ["agent"],
        excludes: [card],
        hasActivate: false,
      });
      for (const agen of activatos) {
        yield util.refreshCard({ source: card, target: agen });
      }
    }
  },
});
