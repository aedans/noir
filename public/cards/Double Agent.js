// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  type: "agent",
  text: "This gains the color of the most common color in your opponent's deck.",
  cost: { money: 4 },
  colors: card.props.colors ?? [],
  onPlay: function* () {
    const filter = { players: [util.opponent(game, card)], zones: ["deck"] };
    const { colors } = util
      .randoms(["orange", "blue", "green", "purple"], 4)
      .map((color) => ({
        colors: [color],
        number: util.filter(cache, game, { players: [util.opponent(game, card)], zones: ["deck"], colors: [color] })
          .length,
      }))
      .reduce((a, b) => (a.number > b.number ? a : b), { colors: [], number: 0 });
    yield* util.setProp(cache, game, card, { target: card, name: "colors", value: colors });
  },
});
