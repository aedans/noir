//ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, game, card) => ({
  text: "Additonal cost: remove a purple card in your deck. Steal an operation and put it hidden into your deck.",
  type: "operation",
  cost: { money: 4 },
  colors: ["purple"],
  targets: {
    players: [util.opponent(game, card)],
    types: ["operation"],
  },
  play: function* (target) {
    const cards = util.filter(game, {
      players: [util.self(game, card)],
      colors: ["purple"],
      zones: ["deck"],
      excludes: [card],
    });

    if (cards.length == 0) {
      throw "No purple cards in your deck";
    }

    yield* util.stealCard(game, { card: target, zone: "deck" });
  },
});