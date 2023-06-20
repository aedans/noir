// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
    type: "agent",
    text: "This costs $1 less for each of your opponent's revealed cards. Whenever you reveal one of your opponent's cards, add a copy to your deck.",
    keywords: [["vip"]],
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
    effect: (affectedInfo, affectedCard) => {
        return {
          onReveal: function*(){
            const nombre = util.getCard(game,affectedCard).name
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