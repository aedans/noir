// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Additional cost: activate five blue agents. Destroy all revealed rank 1 agents you don't control.",
	type: () => "operation",
	colors: () => ["blue"],
	cost: () => ({ money: 40 }),
	rank: () => 3,
}