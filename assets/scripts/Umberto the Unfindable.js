// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "If this would be revealed from your deck, instead destroy two hidden cards in your deck.",
	type: () => "agent",
	colors: () => [],
	cost: () => ({ money: 50 }),
	rank: () => 3,
	reveal: (util, card, player, opponent) => {
		if (player.deck.find(c => c.id == card.id)) {
			const cards = player.deck.filter(c => !c.revealed);
			util.destroyRandom(cards, player, opponent);
			util.destroyRandom(cards, player, opponent);
			card.revealed = false;
		}
	}
}