// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Additional cost: destroy an agent in your deck. Reduce your opponent's money by $20, and gain money equal to the amount lost.",
	type: () => "operation",
	colors: () => ["purple"],
	cost: () => ({ money: 10 }),
	rank: () => 1
}