// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
  type: "agent",
  text: "Activate this, exhaust two blue agents: The next agent your opponent plays has Delay 1.",
  cost: { money: 7, agents: 1 },
  colors: ["blue"],
  effectFilter: {
    players: [util.opponent(game, card)],
    zones: ["deck"],
    types: ["agent"]
  },
  activateCost: {agents: 2},
  activate: function* (){
    yield* util.setProp(cache,game,card, {target: card, name: "onPatrol", value: true})
  },
  effect: (info, state) => {
    if (card.props.onPatrol == true) {
      return {
        keywords: [...info.keywords, ["delay", 1]],
        play: function* (target) {
          yield* util.exhaustCard(cache, game, card, { target: card });
          yield* info.play(target);
        },
      };
    }
  },
});
