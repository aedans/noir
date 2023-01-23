// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, game, card) => ({
  text: "Activate this and another agent, pay $1: reveal one of your opponent's cards.",
  type: "agent",
  cost: { money: 6 },
  colors: [],
  activateCost: { money: 1, agents: 1 },
  activate: function* () {
    yield* util.revealRandom(game, card, 1, {
      players: [util.opponent(game, card)],
      zones: ["board"],
    });
  },
});
