// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  text: "Reveal two cards in your opponent's deck. After one is played, triple the cost of the other.",
  type: "operation",
  colors: ["blue"],
  cost: { money: 2, agents: 1 },
  play: function* () {
    const revealed = yield* util.revealRandom(cache, game, card, 2, {
      zones: ["deck"],
    });
    if (revealed.length == 2) {
      yield util.modifyCard({
        source: card,
        target: revealed[0],
        modifier: {
          card,
          name: "investigated",
          props: {
            investigated: revealed[1],
          },
        },
      });
      yield util.modifyCard({
        source: card,
        target: revealed[1],
        modifier: {
          card,
          name: "investigated",
          props: {
            investigated: revealed[0],
          },
        },
      });
    }
  },
  modifiers: {
    investigated: (info, modifier, investigatedCard) => ({
      play: function* (action) {
        yield* info.play(action);
        yield util.modifyCard({
          source: card,
          target: modifier.props.investigated,
          modifier: {
            card,
            name: "tripled",
          },
        });
      },
    }),
    tripled: (info, modifier, card) => ({
      cost: { ...info.cost, money: info.cost.money * 3 },
    }),
  },
});
