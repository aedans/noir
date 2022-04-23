// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Activate this and an orange agent: the next card you play costs $10 less. Refresh this.",
	type: () => "location",
	colors: () => ["orange"],
	cost: () => ({ money: 75 }),
	rank: () => 3,
	play: (util, card, player, opponent) => () => card.number.played = 1,
	useCost: () => ({ money: 0, agents: { orange: 1 } }),
	use: (util, card, player, opponent) => () => {
		card.number.played = 0;
		card.activated = false;
	},
	effects: {
		board: (util, state, you, opponent) => (info) => ({
			...info,
			play: (util, card, player, opponent) => {
				const play = (info.play ?? (() => () => {}))(util, card, player, opponent);
				if (play == null) return play;
				return (choice) => {
					play(choice);
					if (you.id == player.id) {
						state.number.played++;
					}
				};
			},
			cost: (util, card, player, opponent) => {
				const cost = info.cost(util, card, player, opponent);
				if (state.number.played == 0 && player.hand.find(h => h.id == card.id)) {
					return { ...cost, money: cost.money - 10 };
				}	else {
					return cost;
				}
			}
		})
	},
}