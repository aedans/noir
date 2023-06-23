// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  text: "Steal an agent from your opponent's board and put it revealed onto your board.",
  type: "operation",
  cost: { money: 16, agents: 1 },
  colors: ["green"],
  targets: {
    players: [util.opponent(game, card)],
    types: ["agent"],
    zones: ["board"],
  },
  play: function* (target) {
    yield* util.stealCard(cache, game, card, { target, zone: "board" });
  },
});
