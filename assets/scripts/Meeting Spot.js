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
	play: (util, card, player, opponent) => () => card.number.played = 0,
	turn: {
		board: (util, card, player, opponent) => card.number.played = 0
	},
	played: {
		board: (util, card, player, opponent) => (played) => {
			if (player.turn && util.getCardInfo(played, player, opponent).type(util, played, player, opponent) == "agent") {
				card.number.played++;
			}
		}
	},
	effects: {
		board: (util, state, player, opponent) => {
			if (state.number.played < 1) {
				return (card) => ({
					...card,
					cost: (util, state, player, opponent) => {
						const cost = card.cost(util, state, player, opponent);
						if (card.type(util, state, player, opponent) == "agent") {
							return { ...cost, money: cost.money - 5 };
						}	else {
							return cost;
						}
					}
				});
			} else {
				return card => card;
			}
		}
	},
}