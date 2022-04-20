// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "When you play this, gain $60. Each turn, lose $5.",
	type: () => "location",
	colors: () => [],
	cost: () => ({ money: 20 }),
	rank: () => 2,
	play: (util, card, player, opponent) => () => player.money += 60,
	turn: {
		board: (util, card, player, opponent) => player.money -= 5
	}
}