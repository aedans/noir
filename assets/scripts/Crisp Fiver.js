// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Gain $5.",
	type: () => "operation",
	colors: () => [],
	cost: () => ({ money: 0 }),
	rank: () => 1,
	play: (util, card, player, opponent) => () => {
		player.money += 5;
	}
}