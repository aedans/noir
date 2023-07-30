// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  type: "agent",
  text: "Exhaust this: steal an agent from your opponent, putting it onto your board revealed. It gains Disloyal.",
  cost: { money: 30, agents: 1 },
  colors: ["green"],
  keywords: [["vip"]],
  activateTargets: {
    zones: ["deck", "board"],
    types: ["agent"],
  },
  activateCost: { agents: 1 },
  activate: function* (target) {
    yield* util.stealCard(cache, game, card, { target, zone: "board" });
    yield* util.modifyCard(cache, game, card, {
      target,
      modifier: {
        card,
        name: "disloyal",
      },
    });
  },
  modifiers: {
    disloyal: (info, modifier, card) => ({
      keywords: [["disloyal"]],
    }),
  },
});
