//@ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  type: "operation",
  text: "Target card loses Delay, Debt, Depart, and Tribute",
  cost: { money: 2, agents: 1 },
  targets: {},
  play: function* (target) {
    yield* util.modifyCard(cache, game, card, { target, modifier: { name: "cleared", card } });
  },
  modifiers: {
    cleared: (info) => ({
      keywords: info.keywords.filter(([name]) => !["delay", "debt", "depart", "tribute"].includes(name)),
    }),
  },
});
