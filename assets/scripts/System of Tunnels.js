// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "The first location you play each turn costs $15 less.",
	type: () => "location",
	colors: () => [],
	cost: () => ({ money: 30 }),
	rank: () => 2,
	play: (util, card, player, opponent) => () => card.number.locations = 0,
	turn: {
		board: (util, card, player, opponent) => card.number.locations = 0
	},
	effects: {
		board: (util, card, you, opponent) => (info) => ({
			...info,
			cost: (util, card, player, opponent) => {
				const cost = info.cost(util, card, player, opponent);
				if (you.turn && card.number.locations++ == 0 && util.getCardInfo(card, player, opponent).type(util, card, player, opponent) == "location") {
					return { ...cost, money: Math.max(5, cost.money - 10) };
				} else {
					return cost;
				}
			}
		})
	}
}