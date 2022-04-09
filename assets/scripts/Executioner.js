// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Additional cost: reveal a hidden rank 3 blue card from your deck. Activate this, reveal a hidden rank 3 card in your deck: destroy a revealed agent.",
	type: () => "agent",
	colors: () => ["blue"],
	cost: () => ({ money: 50 }),
	rank: () => 3,
}