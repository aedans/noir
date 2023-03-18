// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  text: "Choose one of your opponent's agents. It becomes colorless and gains Disloyal.",
  type: "operation",
  cost: { money: 2, agents: 1 },
  colors: [],
  targets: {
    players: [util.opponent(game, card)],
    types: ["agent"],
  },
  play: function* (target) {
    yield* util.modifyCard(cache, game, card, {
      target,
      modifier: {
        card,
        name: "spooked",
      },
    });
  },
  modifiers: {
    spooked: (info) => ({
      text: `${info.text} This is spooked.`,
      keywords: [...info.keywords, ["disloyal"]],
      colors: [],
    }),
  },
});
