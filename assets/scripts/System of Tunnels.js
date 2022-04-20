// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Your locations cost $10 less, but not less than $5.",
	type: () => "location",
	colors: () => [],
	cost: () => ({ money: 30 }),
	rank: () => 2,
	effects: {
		board: (util, card, you, opponent) => (info) => ({
			...info,
			cost: (util, card, player, opponent) => {
				const cost = info.cost(util, card, player, opponent);
				if (you.turn && util.getCardInfo(card, player, opponent).type(util, card, player, opponent) == "location") {
					return { ...cost, money: Math.max(5, cost.money - 10) };
				} else {
					return cost;
				}
			}
		})
	}
}