import type { PartialCardInfoComputation } from "../common/card";

export const card: PartialCardInfoComputation = (util, cache, game, card) => ({
  text: "[A]: spend an agent activation for each of your orange agents. Gain $1 for each.",
  type: "agent",
  cost: { money: 5, agents: 2 },
  colors: ["orange"],
  activate: function* () {
    const agentos = util.filter(cache, game, {
      players: [util.self(game, card)],
      zones: ["board"],
      types: ["agent"],
      colors: ["orange"],
      exhausted: false,
    });
    for (const agent of agentos) {
      yield util.exhaustCard({ source: card, target: agent });
      yield util.addMoney({
        source: card,
        player: util.self(game, card),
        money: 1,
      });
    }
  },
});
