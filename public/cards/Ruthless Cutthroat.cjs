// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  type: "agent",
  text: "Exhaust this: remove one of your opponent's agents. Give two purple cards in your deck Tribute.",
  cost: { money: 14 },
  keywords: [["protected"]],
  colors: ["purple"],
  activateTargets: {
    zones: ["deck", "board"],
    types: ["agent"],
    players: [util.opponent(game, card)],
  },
  activateCost: {agents: 1},
  activate: function* (target) {
    const cards = util.filter(cache, game, {
      players: [util.self(game, card)],
      colors: ["purple"],
      zones: ["deck"],
      excludes: [card],
    });

    if (cards.length <= 1) {
      throw "Not enough purple cards in your deck";
    }

    yield* util.removeCard(cache, game, card, { target });
    const punger = util.randoms(cards, 2);
    yield* util.modifyCard(cache, game, card, {
      target: punger[0],
      modifier: {
        card,
        name: "Tribute",
      },
    });
    yield* util.modifyCard(cache, game, card, {
      target: punger[1],
      modifier: {
        card,
        name: "Tribute",
      },
    });
  },
  modifiers: {
    Tribute: util.keywordModifier(["tribute", "agent"]),
  },
});
