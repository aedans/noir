// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  type: "agent",
  text: "[A]: refresh your other agents. This can only be activated once each turn.",
  cost: { money: 9 },
  turn: function* () {
    yield* util.setProp(cache, game, card, {
      target: card,
      name: "up",
      value: 1,
    });
  },
  activate: function* () {
    if (card.props.up == 1) {
      yield* util.setProp(cache, game, card, {
        target: card,
        name: "up",
        value: 0,
      });
      const activatos = util.filter(cache, game, {
        players: [util.self(game, card)],
        zones: ["board"],
        types: ["agent"],
        excludes: [card],
        hasActivate: true,
      });
      const agentos = util.filter(cache, game, {
        players: [util.self(game, card)],
        zones: ["board"],
        types: ["agent"],
        excludes: [card],
        hasActivate: false,
      });
      for (const agen of activatos) {
        yield* util.refreshCard(cache, game, card, { target: agen });
      }
    }
  },
});
