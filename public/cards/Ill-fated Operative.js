// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
    type: "agent",
    text: "The third time this is activated, remove it.",
    cost: { money: 3 },
    colors: ["orange"],
    onEnter: function* (){
        yield* util.setProp(cache, game, card, { target: card, name: "actionsLeft", value: 2 })
    },
    onExhaust: function* () {
        yield* util.setProp(cache, game, card, { target: card, name: "actionsLeft", value: (card.props.actionsLeft-1) })
        if(card.props.actionsLeft == -1){
            yield* util.removeCard(cache, game, card, { target: card });
        }
    },
  });
  