// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, game, card) => ({
    type: "agent",
    text: "This costs $1 less for each revealed orange agent on your board.",
    get cost(){
      return { money: 8 - util.filter(game, {hidden: false, colors: ["orange"], zones: ["board"], types: ["agent"], players: [util.self(game,card)], excludes: [card]}).length,}
    },
    colors: ["orange"],
  });
  