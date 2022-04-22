// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Your first operation each turn costs $10 less.",
	type: () => "location",
	colors: () => [],
	cost: () => ({ money: 25 }),
	rank: () => 1,
	play: (util, card, player, opponent) => () => card.number.operations = 0,
	turn: {
		board: (util, card, player, opponent) => card.number.operations = 0
	},
	effects: { 
		board: (util, card, you, opponent) => (info) => ({
			...info,
			cost: (util, card, player, opponent) => {
				const cost = info.cost(util, card, player, opponent);
				if (you.turn && card.number.operations++ == 0 && util.getCardInfo(card, player, opponent).type(util, card, player, opponent) == "operation") {
					return { ...cost, money: Math.max(5, cost.money - 10) };
				} else {
					return cost;
				}
			}
		})
	}
}