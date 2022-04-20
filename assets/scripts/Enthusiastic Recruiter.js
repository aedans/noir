// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Whenever this is activated, your next agent this turn costs $10 less",
	type: () => "agent",
	colors: () => ["orange"],
	cost: () => ({ money: 45 }),
	rank: () => 2,
	play: (util, card, player, opponent) => () => card.number.played = 1,
	turn: {
		board: (util, card, player, opponent) => card.number.played = 1
	},
	activate: (util, card, player, opponent) => card.number.played = 0,
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
					return { ...cost, money: cost.money - 10 };
				}	else {
					return cost;
				}
			}
		})
	},
}