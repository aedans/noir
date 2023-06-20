// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
    type: "agent",
    text: "This costs $1 less for each agent that has been removed this game.",
    cost: { money: 20 - util.filter(cache,game,{
        zones: ["board", "deck"],
        players: [util.opponent(game,card)],
        hidden: false
    }).length },
    effectFilter: {
        players: [util.opponent(game,card)],
        hidden: true,
        zones: ["board","deck"]
    },
    effect: (info, state) => {
        return {
          onReveal: function*(){
            const nombre = util.getCard(game,card).name
            yield* util.addCard(cache, game, card, {
                target: card,
                name: nombre,
                player: util.currentPlayer(game),
                zone: "deck",
              });
          }
        };
      },
  });