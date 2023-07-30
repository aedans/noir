// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  text: "Steal one of your opponent's cards. It becomes orange. In two turns, give it back.",
  type: "operation",
  cost: { money: 4, agents: 2 },
  colors: ["orange"],
  targets: {
    players: [util.opponent(game, card)],
    zones: ["board", "deck"],
  },
  onPlay: function* () {
    yield* util.enterCard(cache, game, card, { target: card });
  },
  onEnter: function* () {
    yield* util.setProp(cache, game, card, { target: card, name: "turns", value: 2 });
  },
  play: function* (target) {
    yield* util.setProp(cache, game, card, { target: card, name: "target", value: target });
    yield* util.modifyCard(cache, game, card, {
      target,
      modifier: {
        card,
        name: "borrowed",
      },
    }),
      yield* util.stealCard(cache, game, card, { target, zone: util.findCard(game, target).zone });
  },
  turn: function* () {
    if (card.props.turns === 0) {
      yield* util.stealCard(cache, game, card, {
        target: card.props.target,
        zone: util.findCard(game, card.props.target).zone,
      });
      yield* util.removeCard(cache, game, card, { target: card });
      yield* util.setProp(cache, game, card, { target: card, name: "turns", value: undefined });
    } else {
      yield* util.setProp(cache, game, card, { target: card, name: "turns", value: card.props.turns - 1 });
    }
  },
  modifiers: {
    borrowed: (info, modifier, card) => ({
      colors: ["orange"],
    }),
  },
});
