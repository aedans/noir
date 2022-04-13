// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Additional cost: reveal two hidden green cards in your deck. Destroy ten revealed cards.",
	type: () => "operation",
	colors: () => ["green"],
	cost: () => ({ money: 250 }),
	rank: () => 3,
}