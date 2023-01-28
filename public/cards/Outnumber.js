// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, game, card) => ({
    text: "If a player has fewer agents than the other player, reveal cards in their deck equal to the difference.",
    type: "operation",
    cost: { money: 2, agents: 1 },
    colors: ["orange"],
    play: function* () {
      if(util.filter(game, {types:["agent"],zones: ["board"], players: [util.self(game,card)]}).length-
      util.filter(game, {types:["agent"],zones: ["board"], players: [util.opponent(game,card)]}).length > 0){
        yield* util.revealRandom(game, card, util.filter(game, {types:["agent"],zones: ["board"], players: [util.self(game,card)]}).length-
        util.filter(game, {types:["agent"],zones: ["board"], players: [util.opponent(game,card)]}).length, {
            players: [util.opponent(game, card)],
            zones: ["deck"],
          });
      }
      if(util.filter(game, {types:["agent"],zones: ["board"], players: [util.opponent(game,card)]}).length-
      util.filter(game, {types:["agent"],zones: ["board"], players: [util.self(game,card)]}).length > 0){
        yield* util.revealRandom(game, card, util.filter(game, {types:["agent"],zones: ["board"], players: [util.opponent(game,card)]}).length-
        util.filter(game, {types:["agent"],zones: ["board"], players: [util.self(game,card)]}).length, {
            players: [util.self(game, card)],
            zones: ["deck"],
          });
      }
    },
  });