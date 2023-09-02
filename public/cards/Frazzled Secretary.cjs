// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  type: "agent",
  text: "Activate this, [B]: your next agent costs $2 less and has Delay 1.",
  cost: { money: 6 },
  colors: ["blue"],
  turn: function* () {
    yield* util.setProp(cache, game, card, { target: card, name: "processingPaperwork", value: undefined });
  },
  activateCost: { agents: 1 },
  activate: function* () {
    yield* util.setProp(cache, game, card, { target: card, name: "processingPaperwork", value: true });
  },
  effectFilter: {
    zones: ["deck"],
    players: [util.self(game, card)],
    types: ["agent"],
  },
  effect: (affectedInfo, affectedCard) => {
    if (card.props.processingPaperwork == true) {
      return {
        cost: { money: affectedInfo.cost.money - 2, agents: affectedInfo.cost.agents },
        keywords: [...affectedInfo.keywords, ["delay", 1]],
        play: function* (target) {
          yield* util.setProp(cache, game, card, { target: card, name: "processingPaperwork", value: undefined });
          yield* affectedInfo.play(target);
        },
      };
    }
  },
});
