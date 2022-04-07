exports.card = {
	text: (util, card) => {
		let text = "Every other turn: gain a Disgruntled Civilian.";
		if (card.numbers?.turns) {
			text += `\nTurns: ${card.numbers.turns}`;
		} 
		return text;
	},
	type: () => "location",
	colors: () => ["orange"],
	cost: () => ({ money: 60 }),
	play: (util, card, player, opponent) => () => card.numbers.turns = 1,
	turn: {
		board: (util, card, player, opponent) => {
			card.numbers.turns--;
			if (card.numbers.turns == 0) {
				card.numbers.turns = 2;
				player.board.push(util.defaultCardState("Disgruntled Civilian"));
			}
		}
	}
}