// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: (util, card) => {
		let text = "Every other turn: gain a Company Agent.";
		if (card.number?.turns != null) {
			text += `\nTurns: ${card.number.turns}`;
		} 
		return text;
	},
	type: () => "location",
	colors: () => ["green"],
	cost: () => ({ money: 60 }),
	rank: () => 2,
	play: (util, card, player, opponent) => () => card.number.turns = 1,
	turn: {
		board: (util, card, player, opponent) => {
			card.number.turns--;
			if (card.number.turns == 0) {
				card.number.turns = 2;
				player.board.push(util.defaultCardState("Company Agent"));
			}
		}
	}
}