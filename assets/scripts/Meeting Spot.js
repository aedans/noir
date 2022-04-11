// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: (util, card, player, oppoennt) => {
		let text = "The first agent you play each turn costs $5 less.";
		if (card.number?.played != null) {
			text += `\nPlayed: ${card.number.played}`;
		}
		return text;
	},
	type: () => "location",
	colors: () => [],
	cost: () => ({ money: 20 }),
	rank: () => 1,
	play: (util, card, player, opponent) => () => card.number.played = 0,
	turn: {
		board: (util, card, player, opponent) => card.number.played = 0
	},
	effects: {
		board: (util, state, player, opponent) => {
			return (card) => ({
				...card,
				play: (util, c, player, opponent) => {
					const play = (card.play ?? (() => () => {}))(util, c, player, opponent);
					if (play == null) return play;
					return (choice) => {
						play(choice);
						state.number.played++;
					};
				},
				cost: (util, c, player, opponent) => {
					const cost = card.cost(util, c, player, opponent);
					if (state.number.played == 0 && player.hand.find(h => h.id == c.id) && card.type(util, c, player, opponent) == "agent") {
						return { ...cost, money: cost.money - 5 };
					}	else {
						return cost;
					}
				}
			});
		}
	},
}