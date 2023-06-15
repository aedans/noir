// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  text: "Each turn: if you have at least $7, reveal two cards in your opponent's deck and exhaust this.",
  type: "agent",
  cost: { money: 14 },
  colors: ["green"],
  keywords: [["vip"]],
  turn: function* () {
    if (game.players[util.self(game, card)].money >= 7) {
      if (util.filter(cache, game, { hidden: true, players: [util.self(game, card)] }).length > 0) {
        yield* util.revealRandom(cache, game, card, 2, {
          zones: ["deck"],
        });
        yield* util.exhaustCard(cache, game, card, { target: card });
      }
    }
  },
});
