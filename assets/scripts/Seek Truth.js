// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Additional cost: activate a blue agent. Reveal three rank 1 cards in your opponent's deck.",
	type: () => "operation",
	colors: () => ["blue"],
	cost: () => ({ money: 5, agents: { blue: 1 } }),
	rank: () => 1,
	play: (util, card, player, opponent) => () => {
		const cards = util.filter(opponent.deck, "rank/1", player, opponent);
		for (let i = 0; i < 3; i++) {
			util.revealRandom(cards, player, opponent);
		}
	},
}