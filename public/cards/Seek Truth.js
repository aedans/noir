// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, game, card) => ({
    text: "Reveal three cards in your opponent's deck that cost $5 or less.",
    type: "operation",
    cost: { money: 1, agents: 1 },
    colors: ["blue"],
    play: function* () {
        yield* util.revealRandom(game, card, 3, {
            players: [util.opponent(game, card)],
            zones: ["deck"],
            maxMoney: 5
      });
    },
  });