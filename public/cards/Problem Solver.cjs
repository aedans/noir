// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  type: "agent",
  text: "Protected. Activate this, [P]: remove one of your opponent's cards. When one of your cards is removed, Refresh this.",
  cost: { money: 12, agents: 2 },
  keywords: [["protected"]],
  colors: ["purple"],
  activateTargets: {
    zones: ["deck", "board"],
    types: ["agent", "operation"],
    players: [util.opponent(game, card)],
  },
  activateCost: { agents: 1 },
  activate: function* (target) {
    yield* util.removeCard(cache, game, card, { target });
  },
  effectFilter: {
    players: [util.self(game,card)],
    types: ["agent"],
    zones: ["deck","board"]
  },
  effect: (affectedInfo, affectedCard) => {
    return {
      onRemove: function* (){
        yield* util.refreshCard(cache, game, card, {target: card})
    }
  }},
})
