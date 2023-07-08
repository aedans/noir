// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  text: "Remove a card.",
  type: "operation",
  cost: { money: 8, agents: 1 },
  targets: {
    zones: ["board", "deck"]
  },
  play: function* (target) {
    yield* util.removeCard(cache, game, card, { target });
  },
});
