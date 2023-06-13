// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  type: "agent",
  cost: { money: 3 },
  colors: ["orange"],
  keywords: [["abscond", 3]],
});
