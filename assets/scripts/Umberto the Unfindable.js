// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "If this would be revealed from your deck, instead remove two hidden cards in your deck.",
	type: () => "agent",
	colors: () => [],
	cost: () => ({ money: 50 }),
	rank: () => 2,
	reveal: (util, card, player, opponent) => {
		if (player.deck.find(c => c.id == card.id)) {
			const cards = util.filter(player.deck, "hidden", player, opponent)
				.filter(c => c.id != card.id);
			util.removeRandom(cards, player, opponent);
			util.removeRandom(cards, player, opponent);
			if (cards.length >= 2) {
				card.revealed = false;
			} 
		}
	}
}