// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Additional cost: activate a blue agent. Reveal three rank 1 cards in your opponent's deck.",
	type: () => "operation",
	colors: () => ["blue"],
	cost: () => ({ money: 5, agents: { blue: 1 } }),
	rank: () => 1,
	play: (util, card, player, opponent) => () => {
		const cards = opponent.deck.filter(c => util.getCardInfo(c, player, opponent).rank(util, c, player, opponent) <= 1);
		for (let i = 0; i < 3; i++) {
			util.revealRandom(cards, player, opponent);
		}
	},
}