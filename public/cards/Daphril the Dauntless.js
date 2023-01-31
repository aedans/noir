//@ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  type: "agent",
  text: "Activate this: remove the highest cost card in your opponent's deck and the highest cost card on your opponent's board.",
  cost: { money: 36 },
  keywords: ["vip", "protected"],
  activate: function* () {
    const deckstuff = util.filter(cache, game, {
      hidden: false,
      players: [util.opponent(game, card)],
      ordering: ["money"],
      reversed: true,
      zones: ["deck"],
    });
    if (deckstuff.length > 0) {
      yield* util.removeCard(cache, game, card, { target: deckstuff[0] });
    }
    const boardstuff = util.filter(cache, game, {
      hidden: false,
      players: [util.opponent(game, card)],
      ordering: ["money"],
      reversed: true,
      zones: ["board"],
    });
    if (boardstuff.length > 0) {
      yield* util.removeCard(cache, game, card, { target: boardstuff[0] });
    }
  },
});
