// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Additional cost: activate a blue guy. Reveal three hidden tier 1 cards in your opponent's deck.",
	type: () => "operation",
	colors: () => ["blue"],
	cost: () => ({ money: 5 }),
}