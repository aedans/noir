// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  text: "Give an opponent's card Abscond 2.",
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
        name: "absconded",
      },
    });
  },
  modifiers: {
    absconded: util.keywordModifier(["abscond", 2]),
  },
});
