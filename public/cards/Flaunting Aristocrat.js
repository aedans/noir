// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, game, card) => ({
  text: "Each turn: if you have at least $10, reveal two cards in your opponent's deck and exhaust this.",
  type: "agent",
  cost: { money: 15 },
  colors: ["green"],
  keywords: ["vip"],
  turn: function* () {
    if (game.players[util.self(game, card)].money >= 10) {
      yield* util.revealRandom(game, card, 2, {
        players: [util.opponent(game, card)],
        zones: ["deck"],
      });
      yield* util.exhaustCard(game, card, { target: card });
    }
  },
});
