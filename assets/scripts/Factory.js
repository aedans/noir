// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Activate this and a agent, reveal a hidden green card in your deck: gain $60.",
	type: () => "location",
	colors: () => ["green"],
	cost: () => ({ money: 150 }),
	rank: () => 3,
}