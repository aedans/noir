// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  text: "Each turn, reveal the highest cost hidden card.",
  type: "agent",
  cost: { money: 10 },
  keywords: [["disloyal"], ["protected"]],
  turn: function* () {
    const cards = util.filter(cache, game, {
      hidden: true,
      ordering: ["money"],
      reversed: true,
    });

    if (cards.length > 0) {
      yield* util.revealCard(cache, game, card, { target: cards[0] });
    }
  },
});
