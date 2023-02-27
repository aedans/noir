// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  type: "operation",
  text: "Additional cost: reveal the highest cost card in your deck. Reveal three of your opponent's cards.",
  cost: { money: 1, agents: 1 },
  colors: ["green"],
  play: function* () {
    const cards = util.filter(cache, game, {
      players: [util.self(game, card)],
      zones: ["deck"],
      hidden: true,
      excludes: [card],
    });

    if (cards.length == 0) {
      throw "no cards in your deck";
    }

    yield* util.revealRandom(cache, game, card, 3, {
      players: [util.opponent(game, card)],
      zones: ["board"],
    });
    const deckards = util.filter(cache, game, {
      players: [util.self(game, card)],
      zones: ["deck"],
      ordering: ["money"],
      reversed: true,
      excludes: [card],
    });
    yield* util.revealCard(cache, game, card, { target: deckards[0] });
  },
});
