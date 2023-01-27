// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, game, card) => ({
    text: "Costs $2 less for each revealed operation. Reveal four of your opponent's agents.",
    type: "operation",
    get cost(){
        return { money: 16 - 2 * util.filter(game, {hidden: false, types: ["agent"], excludes: [card]}).length, agents: 1 }
      },
    play: function* () {
      yield* util.revealRandom(game, card, 4, {
        players: [util.opponent(game, card)],
        types: ["agent"],
      });
    },
  });
