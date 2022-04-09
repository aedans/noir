// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Additional cost: activate a purple agent. Destroy a revealed agent.",
	type: () => "operation",
	colors: () => ["purple"],
	cost: () => ({ money: 30 }),
	rank: () => 1,
}