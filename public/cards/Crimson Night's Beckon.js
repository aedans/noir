// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
    text: "Remove one of your opponent's agents. Return this to your deck next turn with $2 added to its cost. ",
    type: "operation",
    cost: {
        money:
          card.props.Played
            ? 11 + 2* card.props.Played
            : 11 ,
        agents: 1,
      },
    targets: {
      types: ["agent", "operation"],
    },
    play: function* (target) {
      if(card.props.Played <= 1){
        yield* util.setProp(cache, game, card, {target: card, name: "Played", value: 1})}else{
            yield* util.setProp(cache, game, card, {target: card, name: "Played", value: card.props.Played + 1}),
      yield* util.removeCard(cache, game, card, { target });
      yield* util.bounceCard(cache,game,card, {target: card})
    }},
  });
  