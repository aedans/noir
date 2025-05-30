import type { PartialCardInfoComputation } from "../common/card";

export const card: PartialCardInfoComputation = (util, cache, game, card) => ({
  text: "Activate this, exhaust two agents: gain $2.",
  type: "agent",
  cost: { money: 7 },
  colors: [],
  activateCost: { agents: 1 },
  activate: function* () {
    yield util.addMoney({
      source: card,
      player: util.self(game, card),
      money: 2,
    });
  }
});
