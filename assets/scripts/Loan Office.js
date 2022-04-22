// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Gain $40 the turn after you play this. Each subsequent turn, lose $5.",
	type: () => "location",
	colors: () => [],
	cost: () => ({ money: 20 }),
	rank: () => 2,
	play: (util, card, player, opponent) => () => player.money += 40,
	turn: (util, card, player, opponent) => player.money -= 5
}