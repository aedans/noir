// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  type: "agent",
  cost: { money: 6 },
  text: "Whenever this is activated, if the highest-cost hidden card on the board belongs to your opponent, reveal it.",
  colors: ["orange"],
  onExhaust: function* () {
    const agentos = util.filter(cache, game, {
      zones: ["board"],
      types: ["agent"],
      hidden: true,
      exhausted: false,
      ordering: ["money"],
      reversed: true
    });
    if(util.findCard(game,agentos[0]).player == util.opponent(game,card)){
      yield* util.revealCard(cache, game, card, {target: agentos[0]})
    }
  },
});
