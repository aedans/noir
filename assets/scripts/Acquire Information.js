// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Reveal cards from your opponent's deck equal to the number of purple agents on your board.",
	type: () => "operation",
	colors: () => ["purple"],
	cost: () => ({ money: 10 }),
	rank: () => 2,
	play: (util, card, player, opponent) => () => {
		const agents = util.filter(player.board, "purple agent", player, opponent);
		for (const agent of agents) {
			util.revealRandom(opponent.deck, player, opponent);
		}
	}
}