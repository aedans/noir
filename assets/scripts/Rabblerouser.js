// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
  text: () => "Each turn: a random guy on your board becomes orange.",
  type: () => "agent",
  colors: () => ["orange"],
  cost: () => ({ money: 50 }),
  turn: {
    board: (util, card, player, opponent) => {
      const targets = player.board
        .filter(c => util.getCardInfo(c, player, opponent).type(util, c, player, opponent) == "agent")
        .filter(c => !util.getCardInfo(c, player, opponent).colors(util, c, player, opponent).includes("orange"));
      if (targets.length > 0) {
        util.sample(targets).modifiers.push({ name: "rabbleroused", card: util.cloneDeep(card) });
      }
    }
  },
  modifiers: {
    rabbleroused: (card) => ({
      ...card,
      text: (util, state, player, opponent) => card.text(util, state, player, opponent) + "\nRabbleroused.",
      colors: () => ["orange"]
    })
  }
}