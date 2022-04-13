// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Activate this: if it was hidden, reveal a location on your opponent's board.",
	type: () => "agent",
	colors: () => ["orange"],
	cost: () => ({ money: 40 }),
	rank: () => 1,
	use: (util, card, player, opponent) => () => {
		if (!card.revealed) {
			const cards = opponent.board.filter(c => util.getCardInfo(c, player, opponent).type(util, card, player, opponent) == "location");
			util.revealRandom(cards, player, opponent);
		}
	}
}