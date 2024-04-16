// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  text: "[A]: reveal your opponent's two lowest cost cards.",
  type: "agent",
  cost: { money: 7 },
  colors: ["purple"],
  activate: function* () {
    yield* util.revealRandom(cache, game, card, 2, {
      ordering: ["money"],
    });
  },
});
