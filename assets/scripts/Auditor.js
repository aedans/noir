// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "You can see how much money your opponent has.",
	type: () => "agent",
	colors: () => ["blue"],
	cost: () => ({ money: 50 }),
	play: (util, card) => () => card.modifiers.push({ name: "auditing", card: util.cloneDeep(card) }),
	update: {
		board: (util, card, player, opponent) => card.number.opponentMoney = opponent.money
	},
	modifiers: {
		auditing: (card) => ({
			...card,
			text: (util, state, player, opponent) => `${card.text(util, state, player, opponent)}\nOpponent's money: $${state.number.opponentMoney}`
		})
	}
}