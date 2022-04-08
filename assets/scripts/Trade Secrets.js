// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Additional cost: reveal a random green card in your deck. Reveal three random rank 1 or 2 cards from your opponent's deck.",
	type: () => "operation",
	colors: () => ["green"],
	cost: () => ({ money: 5 }),
	play: (util, state, player, opponent) => {
		const cards = player.deck
			.filter(c => util.getCardInfo(c, player, opponent).colors(util, c, player, opponent).includes("green"))
			.filter(c => !util.isEqual(c, state))
			.filter(c => !c.revealed);
		if (cards.length == 0) return null;
		return () => {
			const card = util.sample(cards);
			if (card) card.revealed = true;
			for (let i = 0; i < 3; i++) {
				const cards = opponent.deck.filter(c => !c.revealed);
				const card = util.sample(cards);
				if (card) card.revealed = true;
			}
		};
	}
}