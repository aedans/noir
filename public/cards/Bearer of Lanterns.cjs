// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
    type: "agent",
    text: "When you play your first operation each turn, reveal one of your opponent's cards. If it was a blue operation, reveal two instead.",
    cost: { money: 7 },
    colors: ["blue"],
    activateCost: { agents: 2 },
    onPlay: function*(){
      yield* util.setProp(cache, game, card, {target: card, name: "lit", value: true})
    },
    turn: function*(){
      yield* util.setProp(cache, game, card, {target: card, name: "lit", value: true})
    },
    effectFilter: {
      players: [util.self(game,card)],
      zones: ["deck"],
      types: ["operation"],
    },
    effect: (info, state) => {
      if(card.props.lit == true){
        return {
          onPlay: function*(action){
            yield* info.onPlay(action) 
            const numberToReveal = cache.getCardInfo(game, state).colors.includes("blue") ? 2 : 1;
            yield* util.revealRandom(cache,game,card,numberToReveal)
            yield* util.setProp(cache, game, card, {target: card, name: "lit", value: false})
          }
        };
      }
    },
  });
  