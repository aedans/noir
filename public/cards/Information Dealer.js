// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  text: "Activate this and another agent, pay $1: reveal a card.",
  type: "agent",
  cost: { money: 6 },
  colors: [],
  activateCost: { money: 1, agents: 1 },
  activate: function* () {
    yield* util.revealRandom(cache, game, card, 1, {});
  },
});
