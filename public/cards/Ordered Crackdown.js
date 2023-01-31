// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  type: "operation",
  text: "Remove each agent that's green, orange, or purple.",
  cost: { money: 24, agents: 6 },
  colors: ["blue"],
  play: function* () {
    const dudes = util.filter(cache, game, {
      hidden: false,
      types: ["agent"],
      colors: ["orange", "green", "purple"],
    });

    for (const dude of dudes) {
      yield* util.removeCard(cache, game, card, { target: dude });
    }
  },
});
