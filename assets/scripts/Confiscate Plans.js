// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Additional cost: activate a blue agent. Destroy up to three revealed operations",
	type: () => "operation",
	colors: () => ["blue"],
	cost: () => ({ money: 25}),
	rank: () => 2,
}