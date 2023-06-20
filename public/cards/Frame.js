// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, cache, game, card) => ({
    text: "Reveal one of your opponent's agents. It gets 'when this is removed, return each Frame to its owner's deck.'",
    type: "operation",
    cost: { money: 3, agents: 1 },
    play: function* () {
      const cartas = util.filter(cache, game, {
        players: [util.opponent(game,card)],
        hidden: true
      });
      const revilled = util.randoms(cartas, 1);
      yield* util.revealCard(cache, game, card, { target: revilled[0] })
      yield* util.modifyCard(cache, game, card, {
        target: revilled[0],
        modifier: {
            card,
            name: "framed"
        }
      })
    },
    modifiers: {
        framed: (info,modifier, card) => ({
            text: "When removed, copies of Frame are returned to deck.",
            onRemoval: function*() {
                const yardframes = util.filter(cache, game, {
                    zones: ["grave"],
                    names: ["Frame"],
                });
                for (const frambo of yardframes) {
                  yield* util.bounceCard(cache, game, card, {target: frambo});
                }
            }
        })
    }
  });
  