// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Pay $20 times the rank of the target: destroy an agent.",
	type: () => "agent",
	colors: () => ["purple"],
	cost: () => ({ money: 70}),
	rank: () => 1
}