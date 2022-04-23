// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Destroy four cards on the board, chosen at random.",
	type: () => "operation",
	colors: () => [],
	cost: () => ({ money: 110 }),
	rank: () => 3,
	play: (util, card, player, opponent) => () => {
		for (let i = 0; i < 4; i++) {
			util.destroyRandom([...player.board, ...opponent.board], player, opponent);
		}
	}
}