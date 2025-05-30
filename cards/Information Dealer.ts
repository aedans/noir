import type { PartialCardInfoComputation } from "../common/card";

export const card: PartialCardInfoComputation = (util, cache, game, card) => ({
  text: "Activate this, exhaust two agents, $1: reveal a card.",
  type: "agent",
  cost: { money: 6 },
  colors: [],
  activateCost: { money: 1, agents: 1 },
  activate: function* () {
    yield* util.revealRandom(cache, game, card, 1, {});
  }
});
