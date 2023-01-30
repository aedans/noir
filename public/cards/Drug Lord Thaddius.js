// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, game, card) => ({
  type: "agent",
  text: "Whenever an agent in your deck is removed on your turn, gain $4.",
  cost: { money: 10, agents: 1 },
  colors: ["purple"],
  effectFilter: {
    players: [util.self(game, card)],
    zones: ["deck"],
    types: ["agent"],
  },
  effect: (info, state) => {
    return {
      onRemove: function* () {
        if (util.currentPlayer(game) == util.self(game, card)) {
          yield* util.addMoney(game, card, {
            player: util.findCard(game, card).player,
            money: 4,
          });
        }
      },
    };
  },
});
