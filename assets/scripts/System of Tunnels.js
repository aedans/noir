// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Your locations cost $10 less, but not less than $5.",
	type: () => "location",
	colors: () => [],
	cost: () => ({ money: 30 }),
	rank: () => 2,
	effects: {
		board: (util, card, player, opponent) => (info) => ({
			...info,
			cost: (util, card, player, opponent) => {
				const c = info.cost(util, card, player, opponent);
				if (util.getCardInfo(card, player, opponent).type(util, card, player, opponent) != "location") {
					return c;
				} else {
					return { 
						...c,
						money: Math.max(5, c.money)
					};
				}
			}
		})
	}
}