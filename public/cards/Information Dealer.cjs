// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  text: "Activate this, pay $1, [2]: reveal a card.",
  type: "agent",
  cost: { money: 6 },
  colors: [],
  activateCost: { money: 1, agents: 2 },
  activate: function* () {
    yield* util.revealRandom(cache, game, card, 1, {});
  },
});
