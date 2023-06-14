// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  type: "agent",
  text: "When this is removed on board, set two random cards in your deck on fire. They burn away two turns from now if not played.",
  cost: { money: 4 },
  colors: ["orange"],
  play: function* () {
    util.setProp(cache, game, card, { target: card, name: "onboard", value: true });
  },
  onRemove: function* () {
    const yourcards = util.filter(cache, game, {
      players: [util.self(game, card)],
      zones: ["deck"],
    });
    const fired = util.randoms(yourcards, 2);
    if (card.props.onboard == true) {
      yield* util.setProp(cache, game, card, {
        target: fired[0],
        name: "aflame",
        value: 2,
      });
      yield* util.setProp(cache, game, card, {
        target: fired[1],
        name: "aflame",
        value: 2,
      });
    }
  },
});
