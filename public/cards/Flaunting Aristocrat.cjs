// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  text: "Activate this, exhaust a green agent, and pay $2: reveal two cards in your opponent's deck. This gets $2 more expensive with each use.",
  type: "agent",
  cost: { money: 14 },
  colors: ["green"],
  keywords: [["vip"]],
  play: function* () {
    yield* util.setProp(cache, game, card, { target: card, name: "Payments", value: 1 });
  },
  activateCost: { money: 2 * card.props.Payments, agents: 1 },
  activate: function* () {
    if (util.filter(cache, game, { hidden: true, zones: ["deck"], players: [util.opponent(game, card)] }).length > 0) {
      yield* util.revealRandom(cache, game, card, 2, {
        zones: ["deck"],
      });
    } else {
      if (
        util.filter(cache, game, { hidden: true, zones: ["board"], players: [util.opponent(game, card)] }).length > 0
      ) {
        yield* util.revealRandom(cache, game, card, 2, {
          zones: ["board"],
        });
      }
    }
    yield* util.setProp(cache, game, card, { target: card, name: "Payments", value: card.props.Payments + 1 });
  },
});
