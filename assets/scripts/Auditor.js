exports.card = {
	text: () => "You can see how much money your opponent has.",
	type: () => "guy",
	colors: () => ["blue"],
	cost: () => ({ money: 50 }),
	play: (util, card) => () => card.modifiers.push({ name: "auditing", card: util.copy(card) }),
	update: {
		board: (util, card, player, opponent) => card.numbers.opponentMoney = opponent.money
	},
	modifiers: {
		auditing: (card) => ({
			...card,
			text: (util, state, player, opponent) => `${card.text(util, state, player, opponent)}\nOpponent's money: $${state.numbers.opponentMoney}`
		})
	}
}