// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, game, card) => ({
    text: "Choose an agent on your board. It gains VIP and Protected.",
    type: "operation",
    cost: { money: 4, agents: 1 },
    colors: ["green"],
    targets: {
        players: [util.self(game,card)],
        types: ["agent"]
    },
    play: function*(target){
        yield* util.modifyCard(game, {
            card: target,
            modifier: {
                card,
                name: "powerful"
            }
        })
    },
    modifiers: {
        powerful: (info) => ({
            text: `${info.text} This is high status.`,
            keywords: [...info.keywords, "vip", "protected"]
        })
    }
  });