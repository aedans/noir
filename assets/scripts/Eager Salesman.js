// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "When this is revealed, your opponent gains $10.",
	type: () => "agent",
	colors: () => ["green"],
	cost: () => ({ money: 20}),
	rank: () => 1,
	reveal: (util, card, player, opponent) => {
		opponent.money += 10;
	}
}