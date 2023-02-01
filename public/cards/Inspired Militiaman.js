// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  type: "agent",
  text: "This costs $1 less for each orange agent on your board",
  cost: {
    money:
      9 -
      util.filter(cache, game, {
        colors: ["orange"],
        zones: ["board"],
        types: ["agent"],
        players: [util.self(game, card)],
        excludes: [card],
      }).length,
  },
  colors: ["orange"],
});
