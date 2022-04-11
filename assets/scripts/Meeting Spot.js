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
		board: (util, state, player, opponent) =>  (info) => ({
			...info,
			play: (util, card, player, opponent) => {
				const play = (info.play ?? (() => () => {}))(util, card, player, opponent);
				if (play == null) return play;
				return (choice) => {
					play(choice);
					state.number.played++;
				};
			},
			cost: (util, card, player, opponent) => {
				const cost = info.cost(util, card, player, opponent);
				if (state.number.played == 0 && player.hand.find(h => h.id == card.id) && info.type(util, card, player, opponent) == "agent") {
					return { ...cost, money: cost.money - 5 };
				}	else {
					return cost;
				}
			}
		})
	},
}