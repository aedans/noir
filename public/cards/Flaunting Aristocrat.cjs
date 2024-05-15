// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  text: "[A][E]: reveal a card from your opponent's deck. This doubles for each use.",
  type: "agent",
  cost: { money: 12 },
  colors: ["green"],
  keywords: [["vip"]],
  play: function* () {
    yield util.setProp({ source: card, target: card, name: "revealAmount", value: 1 });
  },
  activateCost: { agents: 1 },
  activate: function* () {
    yield util.setProp({ source: card, target: card, name: "revealAmount", value: 2 * card.props.revealAmount });
    if (util.filter(cache, game, { hidden: true, zones: ["deck"], players: [util.opponent(game, card)] }).length > 0) {
      yield* util.revealRandom(cache, game, card, card.props.revealAmount, {
        zones: ["deck"],
      });
    } else {
      if (
        util.filter(cache, game, { hidden: true, zones: ["board"], players: [util.opponent(game, card)] }).length > 0
      ) {
        yield* util.revealRandom(cache, game, card, card.props.revealAmount, {
          zones: ["board"],
        });
      }
    }
  },
});
