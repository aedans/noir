exports.card = {
	text: () => "The first time an opponent's card is destroyed on each of your turn, gain $15.",
	type: () => "agent",
	colors: () => ["blue"],
	cost: () => ({ money: 60 }),
	rank: () => 3,
	play: (util, card, player, opponent) => () => card.number.destroyed = 0,
	turn: (util, card, player, opponent) => card.number.destroyed = 0,
	effects: {
		board: (util, state, you, opponent) => (info) => ({
			...info,
			destroy: (util, card, player, opponent) => {
				if (state.number.destroyed == 0 && you.turn) {
					you.money += 15;
				}
				state.number.destroyed++;
			},
		})
	},
}