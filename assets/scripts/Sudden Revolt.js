// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Additional cost: activate any number of orange agents: destroy that many revealed cards on your opponent's board.",
	type: () => "operation",
	colors: () => ["orange"],
	cost: () => ({ money: 30}),
	rank: () => 2
}