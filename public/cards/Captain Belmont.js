// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  type: "agent",
  text: "The first agent your opponent plays each turn has Delay 1 and exhausts this.",
  cost: { money: 9, agents: 1 },
  colors: ["blue"],
  effectFilter: {
    players: [util.opponent(game, card)],
    zones: ["deck"],
  },
  effect: (info, state) => {
    if (!card.exhausted) {
      return {
        keywords: [ ...info.keywords, ["delay", 1]],
        play: function* (target) {
          yield* util.exhaustCard(cache, game, card, { target: card });
          yield* info.play(target);
        },
      };
    }
  },
});
