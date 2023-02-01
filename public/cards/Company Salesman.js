// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  type: "agent",
  text: "When this is played, reveal the lowest cost card in each player's deck.",
  cost: { money: 6 },
  colors: ["green"],
  play: function* (){
    const deckards = util.filter(cache, game, {
      players: [util.self(game, card)],
      zones: ["deck"],
      ordering: ["money"],
      excludes: [card],
    });
    yield* util.revealCard(cache, game, card, { target: deckards[0] });
    const opdeckards = util.filter(cache, game, {
      players: [util.opponent(game, card)],
      zones: ["deck"],
      ordering: ["money"],
      excludes: [card],
    });
    yield* util.revealCard(cache, game, card, { target: opdeckards[0] });
  }
});
