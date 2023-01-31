// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  text: "Additonal cost: remove an agent in your deck. Reveal two cards from your opponent's deck and two from their board.",
  type: "operation",
  cost: { money: 3, agents: 1 },
  colors: ["purple"],
  play: function* (target) {
    const cards = util.filter(cache, game, {
      players: [util.self(game, card)],
      colors: ["purple"],
      zones: ["deck"],
      excludes: [card],
    });

    if (cards.length == 0) {
      throw "No agents in your deck";
    }

    yield* util.revealRandom(cache, game, card, 2, {
      players: [util.opponent(game, card)],
      zones: ["deck"],
    });
    yield* util.revealRandom(cache, game, card, 2, {
      players: [util.opponent(game, card)],
      zones: ["board"],
    });

    const removedCard = util.random(
      util.filter(cache, game, {
        players: [util.findCard(game, card).player],
        zones: ["deck"],
        types: ["agent"],
        excludes: [card],
      })
    );
    yield* util.removeCard(cache, game, card, { target: removedCard });
  },
});
