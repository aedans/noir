// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  type: "agent",
  keywords: ["protected"],
  text: "Your other agents are orange, blue, purple, and green. Your cards cost $1 more for each agent activation they require.",
  cost: { money: 5 },
  effectFilter: {
    players: [util.self(game, card)],
    zones: ["board"],
    types: ["agent"],
  },
  effect: (info, state) => {
    return {
      colors: ["orange", "blue", "purple", "green"],
    };
  },
  secondaryEffectFilter: {
    players: [util.self(game, card)],
    zones: ["deck"],
  },
  secondaryEffect: (info, state) => {
    return {
      cost: { money: info.cost.money + info.cost.agents, agents: info.cost.agents },
    };
  },
});
