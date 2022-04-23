// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "The first agent you play next turn costs $20 less.",
	type: () => "agent",
	colors: () => ["orange"],
	cost: () => ({ money: 40 }),
	rank: () => 1,
	play: (util, card, player, opponent) => () => {
		card.number.turn = 0;
		card.number.played = 1;
	},
	turn: (util, card, player, opponent) => {
		card.number.turn++;
		if (card.number.turn == 1) {
			card.number.played = 0;
		}
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
				if (you.turn && player.id == you.id && state.number.played == 0 &&	util.getCardInfo(card, player, opponent).type(util, card, player, opponent) == "agent") {
					return { ...cost, money: Math.max(0, cost.money - 20) };
				}	else {
					return cost;
				}
			}
		})
	},
}