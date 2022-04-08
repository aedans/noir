// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Additional cost: activate a purple guy. Destroy a revealed guy.",
	type: () => "operation",
	colors: () => ["purple"],
	cost: () => ({ money: 30 }),
}