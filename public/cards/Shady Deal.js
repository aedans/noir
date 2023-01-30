// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, game, card) => ({
  text: "Additional cost: remove an agent in your deck. Next turn, gain $8.",
  type: "operation",
  cost: { money: 2 },
  onPlay: function* () {
    yield* util.enterCard(game, card, { target: card });
  },
  play: function* () {
    const cards = util.filter(game, {
      players: [util.self(game, card)],
      types: ["agent"],
      zones: ["deck"],
    });

    if (cards.length == 0) {
      throw "No agent cards in your deck";
    }
    const removedCard = util.random(
      util.filter(game, {
        players: [util.findCard(game, card).player],
        zones: ["deck"],
        types: ["agent"],
        excludes: [card],
      })
    );
    yield* util.removeCard(game, card, { target: removedCard });
  },
  turn: function* () {
    yield* util.addMoney(game, card, {
      player: util.findCard(game, card).player,
      money: 8,
    });
    yield* util.removeCard(game, card, { target: card });
  },
});
