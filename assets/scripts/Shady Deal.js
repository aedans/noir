// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Additional cost: destroy a agent in your deck. Next turn, gain $40.",
	type: () => "operation",
	colors: () => [],
	cost: () => ({ money: 10 }),
}