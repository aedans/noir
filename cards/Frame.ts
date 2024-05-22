import type { PartialCardInfoComputation } from "../common/card";

export const card: PartialCardInfoComputation = (util, cache, game, card) => ({
  text: "Reveal one of your opponent's agents. It gets 'when this is removed, return each Frame to its owner's deck.'",
  type: "operation",
  cost: { money: 3, agents: 1 },
  play: function* () {
    const revealed = yield* util.revealRandom(cache, game, card, 1);
    if (revealed.length > 0) {
      yield util.modifyCard({
        source: card,
        target: revealed[0],
        modifier: {
          card,
          name: "framed",
        },
      });
    }
  },
  modifiers: {
    framed: (info, modifier, card) => ({
      text: `${info.text} When removed, copies of Frame are returned to deck.`,
      onTarget: function* (action) {
        if (action.type == "game/removeCard") {
          const yardframes = util.filter(cache, game, {
            zones: ["grave"],
            names: ["Frame"],
          });
          for (const frambo of yardframes) {
            yield util.bounceCard({ source: card, target: frambo });
          }
        }

        return yield* info.onTarget(action);
      },
    }),
  },
});
