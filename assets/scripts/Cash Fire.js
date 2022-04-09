// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Additional cost: activate five orange agents and reveal all orange agents from your deck. Set each player's money equal to 0.",
	type: () => "operation",
	colors: () => ["orange"],
	cost: () => ({ money: 0 }),
	rank: () => 3,
}