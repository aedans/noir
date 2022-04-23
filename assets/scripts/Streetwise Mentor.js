// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "The first agent you play next turn costs $20 less.",
	type: () => "agent",
	colors: () => ["orange"],
	cost: () => ({ money: 40}),
	rank: () => 1,
	play: (util, card, player, opponent) => () => card.number.played = 0,
	turn: (util, card, player, opponent) => card.number.played = 1,
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
				if (state.number.played == 0 && player.hand.find(h => h.id == card.id) && 
						util.getCardInfo(card, player, opponent).type(util, card, player, opponent) == "agent") {
					return { ...cost, money: cost.money - 20 };
				}	else {
					return cost;
				}
			}
		})
	},
}