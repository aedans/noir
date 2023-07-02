// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
    type: "agent",
    text: "This costs $1 less for each agent that has been removed this game.",
    cost: { money: 8 - util.filter(cache,game,{
        zones: ["grave"],
        types: ["agent"],
        excludes: [card]
    }).length },
    colors: ["orange"],
  });