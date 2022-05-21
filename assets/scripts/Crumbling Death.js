// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Remove four revealed cards on the board, chosen at random.",
	type: () => "operation",
	colors: () => [],
	cost: () => ({ money: 110 }),
	rank: () => 3,
	play: (util, card, player, opponent) => () => {
		for (let i = 0; i < 4; i++) {
			util.removeRandom(util.filter([...player.board, ...opponent.board], "revealed", player, opponent), player, opponent);
		}
	}
}