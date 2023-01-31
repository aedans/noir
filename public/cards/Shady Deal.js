// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  text: "Additional cost: remove an agent in your deck. Next turn, gain $7.",
  type: "operation",
  cost: { money: 3 },
  onPlay: function* () {
    yield* util.enterCard(cache, game, card, { target: card });
  },
  play: function* () {
    const cards = util.filter(cache, game, {
      players: [util.self(game, card)],
      types: ["agent"],
      zones: ["deck"],
    });

    if (cards.length == 0) {
      throw "No agent cards in your deck";
    }
    const removedCard = util.random(
      util.filter(cache, game, {
        players: [util.findCard(game, card).player],
        zones: ["deck"],
        types: ["agent"],
        excludes: [card],
      })
    );
    yield* util.removeCard(cache, game, card, { target: removedCard });
  },
  turn: function* () {
    yield* util.addMoney(cache, game, card, {
      player: util.findCard(game, card).player,
      money: 7,
    });
    yield* util.removeCard(cache, game, card, { target: card });
  },
});
