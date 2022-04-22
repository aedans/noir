// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Activate this: if it was hidden, reveal a location on your opponent's board.",
	type: () => "agent",
	colors: () => ["orange"],
	cost: () => ({ money: 40 }),
	rank: () => 1,
	use: (util, card, player, opponent) => () => {
		if (card.string.revealed == "false") {
			const cards = util.filter(opponent.board, "location", player, opponent);
			util.revealRandom(cards, player, opponent);
		}
	},
	update: (util, card, player, opponent) => {
		card.string.revealed = `${card.revealed}`;
	}
}