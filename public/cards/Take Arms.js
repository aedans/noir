// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  text: "Exhaust each of your orange agents. Remove that many of your opponent's cards on board at random.",
  type: "operation",
  cost: {
    money: 11,
    agents: util.filter(cache, game, {
      players: [util.self(game, card)],
      types: ["agent"],
      zones: ["board"],
      colors: ["orange"],
      exhausted: false,
    }).length,
  },
  colors: ["orange"],
  play: function* () {
    for (let i = 0; i < (this.cost?.agents ?? 0); i++) {
      util.exhaustCard(cache, game, card, { target: card });
      if (util.filter(cache, game, { players: [util.opponent(game, card)], zones: ["board"], hidden: false }).length > 0) {
        const cards = util.filter(cache, game, {
          hidden: false,
          players: [util.opponent(game, card)],
          zones: ["board"],
        });
        for (const target of util.randoms(cards, 1)) {
          yield* util.removeCard(cache, game, card, { target });
        }
      }
    }
  },
});
