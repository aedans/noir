// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Activate this and another green agent: reveal the highest cost card in your opponent's deck.",
	type: () => "agent",
	colors: () => ["green"],
	cost: () => ({ money: 70 }),
	rank: () => 2,
	useCost: () => ({ money: 0, agents: { green: 1 } }),
	use: (util, card, player, opponent) => {
		const cards = [...opponent.deck.filter(x => !x.revealed)];
		if (cards.length == 0) return null;
		return () => {
			cards.sort((a, b) => {
				const aCost = util.getCardInfo(a, player, opponent).cost(util, a, player, opponent).money;
				const bCost = util.getCardInfo(b, player, opponent).cost(util, b, player, opponent).money;
				return bCost - aCost;
			});
			util.reveal(cards[0].id, player, opponent);
		}
	}	
}