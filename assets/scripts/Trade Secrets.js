// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Additional cost: reveal a random green card in your deck. Reveal three rank 1 or 2 cards from your opponent's deck.",
	type: () => "operation",
	colors: () => ["green"],
	cost: () => ({ money: 5 }),
	rank: () => 1,
	play: (util, state, player, opponent) => {
		const cards = util.filter(player.deck, "hidden green", player, opponent).filter(c => c.id != state.id)
		if (cards.length == 0) return null;
		return () => {
			util.revealRandom(cards, player, opponent);
			const opponentCards = util.filter(opponent.deck, "rank/1/2", player, opponent);
			for (let i = 0; i < 3; i++) {
				util.revealRandom(opponentCards, player, opponent);
			}
		};
	}
}