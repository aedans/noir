// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
  text: () => "Each turn: a random agent on your board becomes orange.",
  type: () => "agent",
  colors: () => ["orange"],
  cost: () => ({ money: 50 }),
	rank: () => 3,
  turn:  (util, card, player, opponent) => {
    const cards = util.filter(player.board, "orange agent", player, opponent);
    if (cards.length > 0) {
      util.sample(cards).modifiers.push({ name: "rabbleroused", card: card.id });
    }
  },
  modifiers: {
    rabbleroused: (info) => ({
      ...info,
      colors: () => ["orange"]
    })
  }
}