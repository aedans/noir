// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Additional cost: activate a blue agent. Reveal three hidden rank 1 cards in your opponent's deck.",
	type: () => "operation",
	colors: () => ["blue"],
	cost: () => ({ money: 5 }),
	rank: () => 1,
}