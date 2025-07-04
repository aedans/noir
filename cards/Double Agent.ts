import type { CardColor, PartialCardInfoComputation } from "../common/card";

export const card: PartialCardInfoComputation = (util, cache, game, card) => ({
  type: "agent",
  text: "This gains the color of the most common color in your opponent's deck.",
  cost: { money: 4 },
  colors: card.props.colors ?? [],
  play: function* () {
    const coloredCards = util
      .filter(cache, game, {
        players: [util.opponent(game, card)],
        zones: ["deck"],
      })
      .filter((state) => cache.getCardInfo(game, state).colors.length > 0);

    if (coloredCards.length == 0) {
      return;
    }

    const { colors } = util
      .randoms(["orange", "blue", "green", "purple"] as CardColor[], 4)
      .map((color) => ({
        colors: [color],
        number: util.filter(cache, game, {
          players: [util.opponent(game, card)],
          zones: ["deck"],
          colors: [color],
        }).length,
      }))
      .reduce((a, b) => (a.number > b.number ? a : b), { colors: [], number: 0 });
    yield util.setProp({ source: card, target: card, name: "colors", value: colors });
  },
  evaluate: () => ({ value: 0 }),
});
