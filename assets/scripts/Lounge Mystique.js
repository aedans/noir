// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "The first rank 3 agent you play each turn costs $20 less.",
	type: () => "location",
	colors: () => [],
	cost: () => ({ money: 35 }),
	rank: () => 2,
	play: (util, card, player, opponent) => () => card.number.played = 0,
	turn: (util, card, player, opponent) => card.number.played = 0,
	effects: {
		board: (util, state, player, opponent) => (info) => ({
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
				if (state.number.played == 0&& 
						util.getCardInfo(card, player, opponent).type(util, card, player, opponent) == "agent" &&
						util.getCardInfo(card, player, opponent).rank(util, card, player, opponent) == 3) {
					return { ...cost, money: Math.max(0, cost.money - 20) };
				}	else {
					return cost;
				}
			}
		})
	},
}