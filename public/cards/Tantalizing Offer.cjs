// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  text: "Steal an agent on your opponent's board.",
  type: "operation",
  cost: { money: 16, agents: 1 },
  colors: ["green"],
  targets: {
    players: [util.opponent(game, card)],
    types: ["agent"],
    zones: ["board"],
  },
  play: function* (target) {
    yield util.stealCard({ source: card, target, zone: "board" });
  },
});
