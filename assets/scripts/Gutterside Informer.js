// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Each turn: reveal the lowest cost hidden card in your opponent's deck.",
	type: () => "agent",
	colors: () => ["purple"],
	cost: () => ({ money: 50 }),
	rank: () => 2,
	turn: (util, card, player, opponent) => {
		const cards = [...util.filter(opponent.deck, "hidden", player, opponent)];
		cards.sort((a, b) => {
			const aCost = util.getCardInfo(a, player, opponent).cost(util, a, player, opponent).money;
			const bCost = util.getCardInfo(b, player, opponent).cost(util, b, player, opponent).money;
			return aCost - bCost;
		});
		if (cards.length > 0) {
			util.reveal(card.id, player, opponent);
			util.reveal(cards[0].id, player, opponent);
		}
	}
}