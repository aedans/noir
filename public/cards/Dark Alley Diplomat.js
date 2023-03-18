// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  type: "agent",
  text: "This agent is all colors.",
  cost: { money: 7 },
  colors: ["purple", "blue", "orange", "green"],
  keywords: [["disloyal"]],
});
