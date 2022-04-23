// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Whenever one of your green agents is activated, gain $5.",
	type: () => "location",
	colors: () => ["green"],
	cost: () => ({ money: 45 }),
	rank: () => 1,
	effects: {
		board: (util, card, player, opponent) => (info) => ({
			...info,
			activate: (util, card, player, opponent) => {
				if (util.getCardInfo(card, player, opponent).colors(util, card, player, opponent).includes("green") &&
						util.getCardInfo(card, player, opponent).type(util, card, player, opponent) == "agent") {
					player.money += 5;
				}
			}
		})
	}
}