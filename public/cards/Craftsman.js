// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, game, card) => ({
  text: "The first card you play each turn costs $2 less.",
  type: "agent",
  cost: { money: 9 },
  colors: [],
  keywords: ["disloyal", "protected"],
  turn: function* () {
    yield* util.setProp(game, { card, name: "ready", value: true });
  },
  effect: (info, state) => {
    const { player, zone } = util.findCard(game, state);
    if (card.props.ready && zone == "deck" && player == util.currentPlayer(game)) {
      return {
        cost: { ...info.cost, money: info.cost.money - 2 },
        play: function* (target) {
          yield* util.setProp(game, { card, name: "ready", value: false });
          yield* info.play(target);
        }
      }
    } else {
      return {};
    }
  }
});