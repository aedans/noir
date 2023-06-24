// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  type: "agent",
  cost: { money: 6 },
  text: "When this is removed, add a purple Random Citizen to your deck.",
  colors: ["purple"],
  onRemove: function* () {
    const target = util.cid();
    yield* util.addCard(cache, game, card, {
      target,
      name: "Random Citizen",
      player: util.self(game, card),
      zone: "deck",
    });

    yield* util.modifyCard(cache, game, card, {
      target,
      modifier: {
        name: "purple",
        card,
      },
    });
  },
  modifiers: {
    purple: (info) => ({
      colors: ["purple"],
    }),
  },
});
