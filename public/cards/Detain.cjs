// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  text: "Put a card on your opponent's board back into their deck. It gains delay 2. This costs $4 less if you have at least three blue agents.",
  type: "operation",
  colors: ["blue"],
  cost: {
    money:
      util.filter(cache, game, {
        players: [util.self(game, card)],
        colors: ["blue"],
        types: ["agent"],
        zones: ["board"],
      }).length > 2
        ? 1
        : 5,
    agents: 1,
  },
  targets: {
    players: [util.opponent(game, card)],
    types: ["agent", "operation"],
    zones: ["board"],
  },
  play: function* (target) {
    yield* util.modifyCard(cache, game, card, {
      target,
      modifier: {
        card,
        name: "slowed",
      },
    });
    yield* util.exhaustCard(cache, game, card, { target });
    yield* util.bounceCard(cache, game, card, { target });
  },
  modifiers: {
    slowed: util.keywordModifier(["delay", 2]),
  },
});