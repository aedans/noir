// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Reveal two cards on your opponent's board.",
	type: () => "operation",
	colors: () => [],
	cost: () => ({ money: 10 }),
	rank: () => 1,
	play: (util, card, player, opponent) => () => {
		util.revealRandom(opponent.board, player, opponent);
		util.revealRandom(opponent.board, player, opponent);
	}
}