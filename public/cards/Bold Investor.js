//ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, game, card) => ({
    type: "agent",
    text: "Activate this: gain $12. Remove this.",
    cost: {money:8},
    colors: ["green"],
    activate: function* (){
        yield* util.addMoney(game, {
            player: util.currentPlayer(game),
            money: 12,
          });
        yield* util.removeCard(game, { card: card });
    }
});