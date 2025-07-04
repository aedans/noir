import type { PartialCardInfoComputation } from "../common/card";

export const card: PartialCardInfoComputation = (util, cache, game, card) => ({
  type: "operation",
  text: "Additional cost: reveal the highest cost card in your deck. Reveal three cards.",
  cost: { money: 1, agents: 1 },
  colors: ["green"],
  play: function* () {
    const cards = util.filter(cache, game, {
      players: [util.self(game, card)],
      zones: ["deck"],
      hidden: true,
      excludes: [card],
    });

    if (cards.length == 0) {
      throw "No cards in your deck";
    }

    yield* util.revealRandom(cache, game, card, 3);
    const deckards = util.filter(cache, game, {
      players: [util.self(game, card)],
      zones: ["deck"],
      ordering: ["money"],
      reversed: true,
      excludes: [card],
    });

    if (deckards.length > 0) {
      yield util.revealCard({ source: card, target: deckards[0] });
    }
  },
});
