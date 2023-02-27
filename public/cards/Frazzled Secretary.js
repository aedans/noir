// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  type: "agent",
  text: "Activate this: your next agent costs $3 less. It comes into play a turn later.",
  cost: { money: 6 },
  colors: ["blue"],
  turn: function* (){
    yield* util.setProp(cache, game, card, {target: card, name: "processingPaperwork", value: false})
  },
  activate: function* (){
    yield* util.setProp(cache, game, card, {target: card, name: "processingPaperwork", value: true})
  },
  effectFilter: {
    zones: ["deck"],
    players: [util.self(game,card)],
    types: ["agent"],
  },
  effect: (affectedInfo, affectedCard) => {
    if(card.props.processingPaperwork == true){
      return{
        cost: {money: affectedInfo.cost.money-2, agents: affectedInfo.cost.agents},
        play: function* (target){
          yield* util.modifyCard(cache, game, affectedCard, {
            target: affectedCard,
            modifier: {
              card,
              name: "processing",
            },
          });
          yield* util.setProp(cache, game, affectedCard, {target: affectedCard, name: "training", value: (card.props.training ?? 0) + 1 })
          yield* util.setProp(cache, game, card, {target: card, name: "processingPaperwork", value: undefined})
          yield* affectedInfo.play(target)
        }
      }
    }
  },
  modifiers: {
    processing: (modifiedInfo,proc,modifiedCard) => ({
      turn: function* (){
        if(modifiedCard.props.training > 0){
          yield* util.exhaustCard(cache, game, card, {target: modifiedCard})
          yield* util.setProp(cache, game, card, {target: modifiedCard, name: "training", value: card.props.training - 1})
        }
      }
    }),
  },
});
