// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "The first agent you play each turn costs $5 less.",
	type: () => "location",
	colors: () => [],
	cost: () => ({ money: 20 }),
	rank: () => 1,
	play: (util, card, player, opponent) => () => card.number.played = 0,
	turn: (util, card, player, opponent) => card.number.played = 0,
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
				if (you.turn && player.id == you.id && state.number.played == 0 && info.type(util, card, player, opponent) == "agent") {
					return { ...cost, money: Math.max(0, cost.money - 5) };
				}	else {
					return cost;
				}
			}
		})
	},
}