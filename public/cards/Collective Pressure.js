// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  text: "Give an opponent's card Depart 2.",
  type: "operation",
  cost: { money: 0, agents: 2 },
  colors: ["orange"],
  targets: {
    zones: ["deck"],
    players: [util.opponent(game, card)],
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
    departed: util.keywordModifier(["depart", 2])
  },
});
