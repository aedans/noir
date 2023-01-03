// @ts-check

/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util,game,card) => ({
    text: "Each turn: gain $4.",
    type: "agent",
    cost: {money:10}, 
    keywords: ["disloyal", "protected"], 
    turn: function* () {
        yield* util.addMoney(game, {
            player: util.currentPlayer(game),
            money: 2,
        });
    },
});