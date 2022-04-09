// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Additional cost: activate a green agent. Next turn, gain $25.",
	type: () => "operation",
	colors: () => ["green"],
	cost: () => ({ money: 5 }),
	rank: () => 1,
}