// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, game, card) => ({
  type: "operation",
  text: "Additional cost: reveal the lowest cost card in your deck. Reveal three of your opponent's cards.",
  cost: { money: 1, agents: 1 },
  colors: ["green"],
  play: function* () {
    const cards = util.filter(game, {
      players: [util.self(game, card)],
      zones: ["deck"],
      hidden: true,
      excludes: [card],
    });

    if (cards.length == 0) {
      throw "no cards in your deck";
    }

    yield* util.revealRandom(game, card, 3, {
      players: [util.opponent(game, card)],
      zones: ["board"],
    });
    const deckards = util.filter(game, {
      players: [util.self(game, card)],
      zones: ["deck"],
      ordering: ["money"],
      excludes: [card],
    });
    yield* util.revealCard(game, card, { target: deckards[0] });
  },
});
