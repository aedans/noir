// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  text: "Additional cost: Expunge your lowest cost purple agent. Gain $3 for each agent removed anywhere this turn.",
  type: "operation",
  cost: { money: 0, agents: 1 },
  colors: ["purple"],
  play: function* () {
    const cards = util.filter(cache, game, {
      players: [util.self(game, card)],
      colors: ["purple"],
      types: ["agent"],
      zones: ["deck"],
      excludes: [card],
    });

    if (cards.length == 0) {
      throw "No purple cards in your deck";
    }
    const purplecards = util.filter(cache, game, {
      players: [util.self(game, card)],
      zones: ["deck"],
      colors: ["purple"],
      types: ["agent"],
      ordering: ["money"],
      excludes: [card],
    });
    yield* util.removeCard(cache, game, card, { target: purplecards[0] });
    const index = game.history.findIndex((action) => action.type == "game/endTurn");
    const actions = game.history.slice(0, index);
    const removals = actions.filter((action) => action.type == "game/removeCard").length;
    yield* util.addMoney(cache, game, card, {
      player: util.self(game, card),
      money: 3 + 3 * removals,
    });
  },
});
