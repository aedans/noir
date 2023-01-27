//@ts-check

/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, game, card) => ({
    type: "agent",
    text: "Activate this and three agents: remove a revealed card and refresh this.",
    cost: {money:18},
    keywords: ["disloyal", "protected"],
    activateCost: {agents: 3},
    activateTargets: {
        zones: ["board","deck"]
    },
    activate: function*(target) {
        yield* util.removeCard(game, card, {target})
        yield* util.refreshCard(game,card,{target:card})
    }
});