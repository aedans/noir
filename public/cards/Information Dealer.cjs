// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  text: "[A][E], $1: reveal a card.",
  type: "agent",
  cost: { money: 6 },
  colors: [],
  activateCost: { money: 1, agents: 1 },
  activate: function* () {
    yield* util.revealRandom(cache, game, card, 1, {});
  },
  evaluate: (ai) => [ai.settings.revealValue, 0],
});
