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
					state.number.played++;
				};
			},
			cost: (util, card, player, opponent) => {
				const cost = info.cost(util, card, player, opponent);
				if (you.turn && player.id == you.id && state.number.played == 0) {
					return { ...cost, money: Math.max(0, cost.money - 10) };
				}	else {
					return cost;
				}
			}
		})
	},
}