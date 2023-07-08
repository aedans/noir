// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
    text: "Reveal two cards in your opponent's deck. After one is played, triple the cost of the other.",
    type: "operation",
    colors: ["blue"],
    cost: { money: 2, agents: 1 },
    play: function* () {
      const revealed = yield* util.revealRandom(cache, game, card, 2, {
        zones: ["deck"]
      });
      if(revealed.length == 2){
        yield* util.setProp(cache, game, card, {target: revealed[0], name: "investigated", value: revealed[1]})
        yield* util.setProp(cache, game, card, {target: revealed[1], name: "investigated", value: revealed[0]})
        yield* util.modifyCard(cache, game, card, {
            target: revealed[0],
            modifier: {
                card,
                name: "investigated"
            }
        })
        yield* util.modifyCard(cache, game, card, {
            target: revealed[1],
            modifier: {
                card,
                name: "investigated"
            }
          });
        };
      
    },
    modifiers: {
        investigated: (info,modifier,card) => ({
            onPlay: function* (){
                yield* util.modifyCard(cache, game, card, {
                    target: card.props.targeted,
                    modifier: {
                        card,
                        name: "tripled"
                    }
                })
            }
        }),
        tripled: (info, modifier, card) => ({
            cost: { ...info.cost, money: info.cost.money * 3 } 
        })
    }
  });
  