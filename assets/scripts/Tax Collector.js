// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "When this is revealed, gain $5 for each revealed card on your opponent's board.",
	type: () => "agent",
	colors: () => ["blue"],
	cost: () => ({ money: 45 }),
	rank: () => 2,
	reveal: (util, card, player, opponent) => {
		player.money += 5 * util.filter(opponent.board, "revealed", player, opponent).length;
	}
}