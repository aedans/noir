// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Activate this: if it was hidden, destroy a hidden agent in your deck and reveal three cards in your opponent's deck.",
	type: () => "agent",
	colors: () => ["purple"],
	cost: () => ({ money: 40 }),
	rank: () => 1,
	use: (util, card, player, opponent) => () => {
		if (!card.revealed) {
			const cards = player.deck
				.filter(c => util.getCardInfo(c, player, opponent).type(util, c, player, opponent) == "agent")
				.filter(c => !c.revealed);
			util.destroyRandom(cards, player, opponent);
			for (let i = 0; i < 3; i++) {
				util.revealRandom(opponent.deck, player, opponent);
			}
		}
	}
}