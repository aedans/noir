// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Whenever this is activated, reveal a card on each player's board.",
	type: () => "agent",
	colors: () => ["orange"],
	cost: () => ({ money: 40}),
	rank: () => 1,
	activate: (util, card, player, opponent) => {
		util.revealOne(player.board, player, opponent);
		util.revealOne(opponent.board, player, opponent);
	}
}