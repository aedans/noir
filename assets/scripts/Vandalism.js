// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Additional cost: activate N orange agents. Destroy a location with rank up to N-2.",
	type: () => "operation",
	colors: () => ["orange"],
	cost: () => ({ money: 20}),
	rank: () => 2
}