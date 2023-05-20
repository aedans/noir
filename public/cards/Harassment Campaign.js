// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
    text: "Put a card on your opponent's board into their deck, then remove all your money. It costs that much more.",
    type: "operation",
    cost: { money: 0, agents: 1 },
    colors: [ "green" ],
    targets: {
      players: [util.opponent(game, card)],
      types: ["agent","operation"],
      zones: ["board"],
    },
    play: function* (target) {
      yield* util.modifyCard(cache, game, card, {
        target,
        modifier: {
          card,
          name: "blackmailed",
        },
      });
      yield* util.setProp(cache, game, card, {target: card, name: "x", value: game.players[util.self(game,card)].money})
      yield* util.removeMoney(cache, game, card, { 
        player: util.self(game,card),
        money: card.props.x
        })
      yield* util.bounceCard(cache, game, card, { target });
    },
    modifiers: {
      blackmailed: (info, modifier, card) => ({
        cost: {money: info.cost.money + card.props.x, agents: info.cost.agents},       
      }),
    },
  });
  