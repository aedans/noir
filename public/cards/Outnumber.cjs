// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  text: "If a player has fewer agents than the other player, reveal cards equal to the difference.",
  type: "operation",
  cost: { money: 1, agents: 1 },
  colors: ["orange"],
  play: function* () {
    if (
      util.filter(cache, game, { types: ["agent"], zones: ["board"], players: [util.self(game, card)] }).length -
        util.filter(cache, game, { types: ["agent"], zones: ["board"], players: [util.opponent(game, card)] }).length >
      0
    ) {
      yield* util.revealRandom(
        cache,
        game,
        card,
        util.filter(cache, game, { types: ["agent"], zones: ["board"], players: [util.self(game, card)] }).length -
          util.filter(cache, game, { types: ["agent"], zones: ["board"], players: [util.opponent(game, card)] }).length,
        {}
      );
    }
    if (
      util.filter(cache, game, { types: ["agent"], zones: ["board"], players: [util.opponent(game, card)] }).length -
        util.filter(cache, game, { types: ["agent"], zones: ["board"], players: [util.self(game, card)] }).length >
      0
    ) {
      yield* util.revealRandom(
        cache,
        game,
        card,
        util.filter(cache, game, { types: ["agent"], zones: ["board"], players: [util.opponent(game, card)] }).length -
          util.filter(cache, game, { types: ["agent"], zones: ["board"], players: [util.self(game, card)] }).length,
        {}
      );
    }
  },
});
