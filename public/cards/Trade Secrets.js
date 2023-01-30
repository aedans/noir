// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, game, card) => ({
  type: "operation",
  text: "Additional cost: reveal the lowest cost green card in your deck. Reveal the highest cost card in your opponent's deck.",
  cost: { money: 1 },
  colors: ["green"],
  play: function* (target) {
    const cards = util.filter(game, {
      players: [util.self(game, card)],
      colors: ["green"],
      zones: ["deck"],
      hidden: true,
      excludes: [card],
    });

    if (cards.length == 0) {
      throw "no green cards in your deck";
    }

    const opdeckard = util.filter(game, {
      players: [util.opponent(game, card)],
      zones: ["deck"],
      ordering: ["money"],
      hidden: true,
      reversed: true,
    });
    yield* util.revealCard(game, card, { target: opdeckard[0] });
    const deckards = util.filter(game, {
      players: [util.self(game, card)],
      zones: ["deck"],
      ordering: ["money"],
      colors: ["green"],
      excludes: [card],
    });
    yield* util.revealCard(game, card, { target: deckards[0] });
  },
});
