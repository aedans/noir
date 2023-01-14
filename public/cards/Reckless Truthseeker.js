// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, game, card) => ({
    type: "agent",
    cost: { money: 6 },
    text: "Whenever this is activated, reveal a card for each player.",
    colors: ["orange"],
    onExhaust: function* (){
      yield* util.revealRandom(game, card, 1, {
        players: [util.opponent(game, card)],
        zones: ["board"],
      });
      yield* util.revealRandom(game, card, 1, {
        players: [util.self(game, card)],
        zones: ["board"],
      });
    }
  });