// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Additional cost: reveal a random green card in your deck. Reveal three rank 1 or 2 cards from your opponent's deck.",
	type: () => "operation",
	colors: () => ["green"],
	cost: () => ({ money: 5 }),
	rank: () => 1,
	play: (util, state, player, opponent) => {
		const cards = player.deck
			.filter(c => util.getCardInfo(c, player, opponent).colors(util, c, player, opponent).includes("green"))
			.filter(c => c.name != "Trade Secrets")
			.filter(c => !c.revealed);
		if (cards.length == 0) return null;
		return () => {
			util.revealRandom(cards, player, opponent);
			const opponentCards = opponent.deck.filter(c => util.getCardInfo(c, player, opponent).rank(util, c, player, opponent) <= 2);
			for (let i = 0; i < 3; i++) {
				util.revealRandom(opponentCards, player, opponent);
			}
		};
	}
}