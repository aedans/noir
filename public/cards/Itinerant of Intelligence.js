// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
    type: "agent",
    text: "The first time this is exhausted each turn, refresh your other agents.",
    cost: { money: 9 },
    turn: function*(){
        yield* util.setProp(cache, game, card, {
            target: card,
            name: "up",
            value: 1
        })
    },
    onExhaust: function*(){
        if(card.props.up==1){
            yield* util.setProp(cache,game,card, {
                target: card,
                name: "up",
                value: 0 
            })
            const agentos = util.filter(cache, game, {
                players: [util.self(game,card)],
                zones: ["board"],
                types: ["agent"]
            })
            for(const agen of agentos){
                yield* util.refreshCard(cache,game,card, { target: agen })
            }
        }
    }
  });
  