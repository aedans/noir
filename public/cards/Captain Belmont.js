// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, game, card) => ({
  type: "agent",
  text: "The first time an opponent's card is removed on each of your turns, gain $3.",
  cost: { money: 12, agents: 1 },
  colors: ["blue"],
  turn: function* () {
    yield* util.setProp(game, card, { target: card, name: "the_law", value: true });
  },
  effectFilter: {
    players: [util.opponent(game, card)],
  },
  effect: (info, state) => {
    if (card.props.the_law == true) {
      return {
        onRemove: function* () {
          if (util.currentPlayer(game) == util.self(game, card)) {
            yield* util.addMoney(game, card, {
              player: util.findCard(game, card).player,
              money: 4,
            }),
              yield* util.setProp(game, card, { target: card, name: "the_law", value: false });
          }
        },
      };
    }
  },
});
