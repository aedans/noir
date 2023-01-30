// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, game, card) => ({
    text: "When you play or remove this, reveal three cards in your opponent's deck.",
    type: "operation",
    colors: ["purple"],
    cost: { money: 2 },
    onRemove: function* (){
        if(util.currentPlayer(game) == util.self(game, card)){
            yield* util.revealRandom(game, card, 3, {
                players: [util.opponent(game, card)],
                zones: ["deck"],
              });
        }
    },
    play: function* () {
      yield* util.revealRandom(game, card, 3, {
        players: [util.opponent(game, card)],
        zones: ["deck"],
      });
    },
  });
  