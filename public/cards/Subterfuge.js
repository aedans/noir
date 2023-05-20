// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  text: "Additonal cost: Expunge a purple card. Steal an operation and put it hidden into your deck.",
  type: "operation",
  cost: { money: 0 },
  colors: ["purple"],
  targets: {
    players: [util.opponent(game, card)],
    types: ["operation"],
  },
  play: function* (target) {
    const cards = util.filter(cache, game, {
      players: [util.self(game, card)],
      colors: ["purple"],
      zones: ["deck"],
      excludes: [card],
    });

    if (cards.length == 0) {
      throw "No purple cards in your deck";
    }

    yield* util.stealCard(cache, game, card, { target, zone: "deck" });
    const removedCard = util.random(
      util.filter(cache, game, {
        players: [util.findCard(game, card).player],
        zones: ["deck"],
        colors: ["purple"],
        excludes: [card],
      })
    );
    yield* util.removeCard(cache, game, card, { target: removedCard });
  },
});
