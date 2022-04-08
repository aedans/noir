// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Additional cost: activate a purple agent. Whenever a agent in your deck is destroyed on your turn, gain $20.",
	type: () => "agent",
	colors: () => ["purple"],
	cost: () => ({ money: 50 }),
}