// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  type: "operation",
  text: "Remove each of your opponent's revealed cards that cost $6 or less.",
  cost: { money: 10, agents: 5 },
  colors: ["blue"],
  play: function* () {
    const cards = util.filter(cache, game, {
      hidden: false,
      players: [util.opponent(game, card)],
      maxMoney: 6,
    });

    for (const card of cards) {
      yield* util.removeCard(cache, game, card, { target: card });
    }
  },
});
