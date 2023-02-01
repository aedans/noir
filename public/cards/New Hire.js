// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  type: "agent",
  cost: { money: 6 },
  text: "When this is removed, gain $1.",
  colors: ["purple"],
  onRemove: function* (){
    yield* util.addMoney(cache, game, card, {
      player: util.findCard(game, card).player,
      money: 1,
    });
  }
});
