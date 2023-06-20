// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  text: "Exhaust this, pay $2: reveal two cards in your opponent's deck, or their board if all cards in their deck are revealed. This gets $2 more expensive with each use.",
  type: "agent",
  cost: { money: 14 },
  colors: ["green"],
  keywords: [["vip"]],
  play: function* () {
    yield* util.setProp(cache, game, card, { target: card, name: "Payments", value: 1 });
  },
  activateCost: { money: 2 * card.props.Payments },
  activate: function* () {
    if (util.filter(cache, game, { hidden: true, zones: ["deck"], players: [util.opponent(game, card)] }).length > 0) {
      yield* util.revealRandom(cache, game, card, 2, {
        zones: ["deck"],
      });
      yield* util.exhaustCard(cache, game, card, { target: card });
    } else {
      if (
        util.filter(cache, game, { hidden: true, zones: ["board"], players: [util.opponent(game, card)] }).length > 0
      ) {
        yield* util.revealRandom(cache, game, card, 2, {
          zones: ["board"],
        });
        yield* util.exhaustCard(cache, game, card, { target: card });
      }
    }
    yield* util.setProp(cache, game, card, { target: card, name: "Payments", value: card.props.Payments + 1 });
  },
});
