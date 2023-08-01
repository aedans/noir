// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  type: "agent",
  text: "Activate this and exhaust a green agent: gain $12 and remove this at the end of your turn.",
  cost: { money: 8 },
  colors: ["green"],
  activateCost: { agents: 1 },
  turn: function*(){
    if(card.props.bold === true){yield* util.removeCard(cache, game, card, { target: card })};
  },
  activate: function* () {
    yield* util.addMoney(cache, game, card, {
      player: util.currentPlayer(game),
      money: 12,
    });
    yield* util.setProp(cache, game, card, {target: card, name: "bold", value: true})
  },
});
