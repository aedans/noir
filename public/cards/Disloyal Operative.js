// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  text: "When this is removed while on your board, Expunge an agent.",
  type: "agent",
  cost: { money: 4 },
  colors: ["purple"],
  play: function *(){
    util.setProp(cache,game,card,{target: card, name: "onboard", value: true})
  }, 
  onRemove: function* () {
    const removedCard = util.random(
      util.filter(cache, game, {
        players: [util.findCard(game, card).player],
        zones: ["deck"],
        types: ["agent"],
        excludes: [card],
      })
    );
    if(card.props.onboard == true){
      yield* util.removeCard(cache,game, card, { target: removedCard });
    }
  },
});
