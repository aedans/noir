// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  type: "agent",
  text: "Activate this, [B][B]: remove an operation and gain $2.",
  cost: { money: 10 },
  colors: ["blue"],
  keywords: [["protected"]],
  activateCost: { agents: 2 },
  activateTargets: {
    types: ["operation"],
    zones: ["deck", "board"],
  },
  activate: function* (target) {
    yield* util.removeCard(cache, game, card, { target });
    yield* util.addMoney(cache, game, card, {
      player: util.findCard(game, card).player,
      money: 2,
    });
  },
});
