// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, game, card) => ({
  text: "Remove an agent.",
  type: "operation",
  cost: { money: 50 },
  targets: () => util.filter(game, {
    types: ["agent"],
  }),
  play: function* (target) {
    yield util.removeCard({ card: target });
  }
});