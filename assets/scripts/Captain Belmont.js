exports.card = {
	text: () => "The first time an opponent's card is removed on each of your turn, gain $15.",
	type: () => "agent",
	colors: () => ["blue"],
	cost: () => ({ money: 60 }),
	rank: () => 2,
	play: (util, card, player, opponent) => () => card.number.removeed = 0,
	turn: (util, card, player, opponent) => card.number.removeed = 0,
	effects: {
		board: (util, state, you, opponent) => (info) => ({
			...info,
			remove: (util, card, player, opponent) => {
				if (state.number.removeed == 0 && you.turn) {
					you.money += 15;
				}
				state.number.removeed++;
			},
		})
	},
}