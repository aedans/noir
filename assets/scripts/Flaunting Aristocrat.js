// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Each turn: if you have more than $50, reveal two cards in your opponent's deck.",
	type: () => "agent",
	colors: () => ["green"],
	cost: () => ({ money: 80}),
	rank: () => 2
}