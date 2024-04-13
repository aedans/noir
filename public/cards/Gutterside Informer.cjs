// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  text: "Activate this, [P]: reveal your opponent's two lowest cost cards.",
  type: "agent",
  cost: { money: 7 },
  colors: ["purple"],
  activateCost: { agents: 1 },
  activate: function* () {
    const cards = yield* util.revealRandom(cache, game, card, 2, {
      ordering: ["money"],
    });
    console.log(cards);
  },
});
