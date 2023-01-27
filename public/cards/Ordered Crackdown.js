// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, game, card) => ({
    type: "operation",
    text: "Remove each agent that's green, orange, or purple.",
    cost: { money: 24, agents: 6 },
    colors: ["blue"],
    play: function* () {
        const dudes = util.filter(game, {
          hidden: false,
          types: ["agent"],
          colors: ["orange", "green", "purple"]
        });
    
        for (const dude of dudes) {
          yield* util.removeCard(game, card, { target: dude });
        }
      }

  });

  