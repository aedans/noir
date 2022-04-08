// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Additional cost: reveal a hidden tier 3 blue card from your deck. Activate this, reveal a hidden tier 3 card in your deck: destroy a revealed guy.",
	type: () => "agent",
	colors: () => ["blue"],
	cost: () => ({ money: 50 }),
}