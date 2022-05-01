// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Additional cost: remove a purple card in your deck. All cards become hidden.",
	type: () => "operation",
	colors: () => ["purple"],
	cost: () => ({ money: 175 }),
	rank: () => 3,
	play: (util, card, player, opponent) => {
		const cards = util.filter(player.deck, "purple", player, opponent).filter(c => c.id != card.id)
		if (cards.length == 0) return null;
		return () => {
			util.destroy(util.sample(cards).id, player, opponent);
			for (const card of [...player.deck, ...player.board, ...opponent.deck, ...opponent.board]) {
				card.revealed = false;
			}
		}
	}
}