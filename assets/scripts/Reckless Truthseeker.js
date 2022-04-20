// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Whenever this is activated, reveal a card on each player's board.",
	type: () => "agent",
	colors: () => ["orange"],
	cost: () => ({ money: 30}),
	rank: () => 1,
	activate: (util, card, player, opponent) => {
		util.revealRandom(player.board, player, opponent);
		util.revealRandom(opponent.board, player, opponent);
	}
}