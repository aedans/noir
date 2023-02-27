// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
    text: "The next agent you play costs $4 less and gains 'this can't be activated the turn after it is played.'",
    type: "operation",
    cost: { money: 0, agents: 1 },
    colors: ["blue"],
    onPlay: function* () {
      yield* util.enterCard(cache, game, card, { target: card });
    },
    play: function* (){
      yield* util.setProp(cache, game, card, {target: card, name: "awaitingTrainee", value: true})
    },
    effectFilter: {
      zones: ["deck"],
      players: [util.self(game,card)],
      types: ["agent"],
    },
    effect: (affectedInfo, affectedCard) => {
      if(card.props.awaitingTrainee == true){
        return{
          cost: {money: affectedInfo.cost.money-4, agents: affectedInfo.cost.agents},
          play: function* (target){
            yield* util.modifyCard(cache, game, affectedCard, {
              target: affectedCard,
              modifier: {
                card,
                name: "training",
              },
            });
            yield* util.setProp(cache, game, affectedCard, {target: affectedCard, name: "training", value: (card.props.training ?? 0) + 1 })
            yield* util.setProp(cache, game, card, {target: card, name: "awaitingTrainee", value: false})
            yield* affectedInfo.play(target)
          }
        }
      }
    },
    modifiers: {
      training: (modifiedInfo,tran,modifiedCard) => ({
        turn: function* (){
          if(modifiedCard.props.training > 0){
            yield* util.exhaustCard(cache, game, card, {target: modifiedCard})
            yield* util.setProp(cache, game, card, {target: modifiedCard, name: "training", value: card.props.training - 1})
          }
          yield* util.setProp(cache, game, card, {target: card, name: "awaitingTrainee", value: undefined})
          yield* util.removeCard(cache, game, card, {target:card})
        }
      }),
    },
  });
  