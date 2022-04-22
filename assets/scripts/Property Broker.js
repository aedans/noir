// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "When this is revealed, gain $10 for each location on your board.",
	type: () => "agent",
	colors: () => ["green"],
	cost: () => ({ money: 60 }),
	rank: () => 3,
	reveal: (util, card, player, opponent) => {
		player.money += util.filter(player.board, "location", player, opponent).length * 10;
	}
}