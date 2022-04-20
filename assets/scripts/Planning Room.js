// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Your operations costs $10 less, but not less than $5.",
	type: () => "location",
	colors: () => [],
	cost: () => ({ money: 30 }),
	rank: () => 1,
	effects: { 
		board: (util, card, player, opponent) => (info) => ({
			...info,
			cost: (util, card, player, opponent) => {
				const cost = info.cost(util, card, player, opponent);
				return { ...cost, money: Math.max(5, cost.money - 10) };
			}
		})
	}
}