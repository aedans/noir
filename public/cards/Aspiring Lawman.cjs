// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  type: "agent",
  keywords: [["delay", 1]],
  cost: { money: 4 },
  colors: ["blue"],
});
