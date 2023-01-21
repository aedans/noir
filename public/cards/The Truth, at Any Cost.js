// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, game, card) => ({
    text: "Additional cost: remove one of your orange agents. Reveal five cards from your opponent's deck",
    type: "operation",
    cost: { money: 1, agents: 1 },
    colors: ["orange"],
    targets: {
        types: ["agent"],
        players: [util.self(game,card)],
        zones: ["board"]
    },
    play: function* (target) {
      yield* util.revealRandom(game, card, 5, {
        players: [util.opponent(game, card)],
        zones: ["deck"],
      });
      yield* util.removeCard(game, {card: target})
    },
  });