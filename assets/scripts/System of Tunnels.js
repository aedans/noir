// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "The first location you play each turn costs $15 less.",
	type: () => "location",
	colors: () => [],
	cost: () => ({ money: 30 }),
	rank: () => 2,
	play: (util, card, player, opponent) => () => card.number.played = 1,
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
				if (you.turn && player.id == you.id && state.number.played == 0 && util.getCardInfo(card, player, opponent).type(util, card, player, opponent) == "location") {
					return { ...cost, money: Math.max(0, cost.money - 15) };
				}	else {
					return cost;
				}
			}
		})
	},
}