// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, game, card) => ({
    type: "agent",
    cost: { money: 8 },
    text: "Whenever this is activated, reveal a card in your opponent's deck.",
    colors: ["blue"],
    onExhaust: function* (){
      yield* util.revealRandom(game, card, 1, {
        players: [util.opponent(game, card)],
        zones: ["deck"],
      });
    }
  });