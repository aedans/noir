// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  type: "agent",
  text: "This is all colors. When this is activated to pay for a colored card, remove that color from this.",
  cost: { money: 5 },
  colors: card.props.colors ?? ["green", "blue", "orange", "purple"],
  keywords: [["disloyal"]],
  onPlay: function*(){
    yield* util.setProp(cache, game, card, {
      target: card,
      name: "colors",
      value: ["green","orange","blue","purple"],
    })
  },
  onExhaust: function*(action){
    if(action.source){
      const remcol = util.getCard(game, action.source)
      const remcoll = util.getCardInfo(cache, game, remcol).colors
      util.setProp(cache,game,card, {
        target: card,
        name: "colors",
        value: card.props.colors.filter((jeb) => jeb != remcoll)
      })
    }
  }
});
