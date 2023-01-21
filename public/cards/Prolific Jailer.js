// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, game, card) => ({
    type: "agent",
    text: "Activate this and another blue agent: remove an agent.",
    cost: { money: 13 },
    colors: ["blue"],
    keywords: ["protected"],
    activateCost: { agents: 1 },
    activateTargets: {
        zones: ["board","deck"],
        types: ["agent"]
    },
    activate: function*(target) {
        yield* util.removeCard(game, {card: target})
    }
  });