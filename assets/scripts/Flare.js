// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Additional cost: activate a blue agent. Reveal two cards on your opponent's board.",
	type: () => "operation",
	colors: () => ["blue"],
	cost: () => ({ money: 10, agents: { blue: 1 } }),
	rank: () => 1,
	play: (util, card, player, opponent) => () => {
		util.revealRandom(opponent.board, player, opponent);
		util.revealRandom(opponent.board, player, opponent);
	}
}