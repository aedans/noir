// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  type: "agent",
  cost: { money: 4 },
  colors: ["green"],
  keywords: [["debt", 2]],
});
