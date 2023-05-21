// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  text: "Reveal three of your opponent's cards and gain $5. Each turn this is in your deck, reduce its cost by $1.",
  cost: { money: 15 - Math.trunc(game.turn / 2) },
  type: "operation",
  play: function* (target) {
    yield* util.addMoney(cache, game, card, {
      player: util.self(game, card),
      money: 5,
    });
    yield* util.revealRandom(cache, game, card, 3, {
      players: [util.opponent(game, card)],
      zones: ["board"],
    });
  },
});
