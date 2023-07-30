// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  text: "Give an opponent's agent Depart 2.",
  type: "operation",
  cost: { money: 0, agents: 2 },
  colors: ["orange"],
  targets: {
    players: [util.opponent(game, card)],
    types: ["agent"],
  },
  play: function* (target) {
    yield* util.modifyCard(cache, game, card, {
      target,
      modifier: {
        card,
        name: "departed",
      },
    });
  },
  modifiers: {
    departed: util.keywordModifier(["depart", 3]),
  },
});
