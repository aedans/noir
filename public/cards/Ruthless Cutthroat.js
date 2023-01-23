// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, game, card) => ({
  type: "agent",
  text: "Activate this, remove the lowest cost purple card in your deck: destroy one of your opponent's revealed agents.",
  cost: { money: 14 },
  colors: ["purple"],
  activateTargets: {
    zones: ["deck", "board"],
    types: ["agent"],
    players: [util.opponent(game, card)],
  },
  activate: function* (target) {
    const cards = util.filter(game, {
      players: [util.self(game, card)],
      colors: ["purple"],
      zones: ["deck"],
      excludes: [card],
    });

    if (cards.length == 0) {
      throw "No purple cards in your deck";
    }

    yield* util.removeCard(game, card, { target });
    const purplecards = util.filter(game, {
      players: [util.self(game, card)],
      zones: ["deck"],
      colors: ["purple"],
      ordering: ["money"],
      excludes: [card],
    });
    yield* util.removeCard(game, card, { target: purplecards[0] });
  },
});
