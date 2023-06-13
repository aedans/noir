// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  text: "Expunge: agent. Gain $3 for each agent removed anywhere this turn.",
  type: "operation",
  cost: { money: 0, agents: 1 },
  colors: ["purple"],
  keywords: [["expunge", "agent"]],
  play: function* () {
    const purplecards = util.filter(cache, game, {
      players: [util.self(game, card)],
      zones: ["deck"],
      colors: ["purple"],
      types: ["agent"],
      ordering: ["money"],
      excludes: [card],
    });
    const index = game.history.findIndex((action) => action.type == "game/endTurn");
    const actions = game.history.slice(0, index);
    const removals = actions.filter((action) => action.type == "game/removeCard").length;
    yield* util.addMoney(cache, game, card, {
      player: util.self(game, card),
      money: 3 + 3 * removals,
    });
  },
});
