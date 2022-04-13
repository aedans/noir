// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Gain $10.",
	type: () => "operation",
	colors: () => [],
	cost: () => ({ money: 5 }),
	rank: () => 1,
	play: (util, card, player, opponent) => () => {
		player.money += 10;
	}
}