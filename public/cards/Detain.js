// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  text: "Put a card on your opponent's board back into their deck. It gains delay 2. If you have at least three blue agents, this costs no money.",
  type: "operation",
  cost: { 
    money: util.filter(cache,game,{
      players: [util.self(game,card)],
      types: ["agent"],
      zones: ["board"],
    }).length > 2 ? 0 : 5,
    agents: 1
  },
  targets: {
    players: [util.opponent(game, card)],
    types: ["agent", "operation"],
    zones: ["board"],
  },
  play: function* (target) {
    yield* util.modifyCard(cache, game, card, {
      target,
      modifier: {
        card,
        name: "slowed",
      },
    });
    yield* util.exhaustCard(cache, game, card, { target });
    yield* util.bounceCard(cache, game, card, { target });
  },
  modifiers: {
    slowed: util.keywordModifier(["delay", 2]),
  },
});
