// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, game, card) => ({
    type: "agent",
    text: "Activate this and another blue agent: remove an operation.",
    cost: { money: 9 },
    colors: ["blue"],
    keywords: ["protected"],
    activateCost: { agents: 1 },
    activateTargets: {
        types: ["operation"],
        zones: ["deck","board"]
    },
    activate: function*(target) {
        yield* util.removeCard(game, {card: target}),
        util.addMoney(game,{
            player: util.currentPlayer(game),
            money: 2,
        })
    }
  });