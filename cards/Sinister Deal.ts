import type { PartialCardInfoComputation } from "../common/card";

export const card: PartialCardInfoComputation = (util, cache, game, card) => ({
  text: "Gain $3 for each agent removed or stolen anywhere this turn.",
  type: "operation",
  cost: { money: 0, agents: 1 },
  colors: ["purple"],
  keywords: [["tribute", "agent"]],
  play: function* () {
    const purplecards = util.filter(cache, game, {
      players: [util.self(game, card)],
      zones: ["deck"],
      colors: ["purple"],
      types: ["agent"],
      ordering: ["money"],
      excludes: [card],
    });
    const history = [...game.history].reverse();
    const index = history.findIndex((action) => action.type == "game/endTurn");
    const actions = history.slice(0, index);
    const removals =
      actions.filter((action) => action.type == "game/removeCard").length +
      actions.filter((action) => action.type == "game/stealCard").length;
    yield util.addMoney({
      source: card,
      player: util.self(game, card),
      money: 3 + 3 * removals,
    });
  },
});
