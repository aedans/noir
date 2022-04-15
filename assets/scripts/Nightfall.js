// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Additional cost: destroy a purple card in your deck. All cards become hidden.",
	type: () => "operation",
	colors: () => ["purple"],
	cost: () => ({ money: 200 }),
	rank: () => 3,
	play: (util, card, player, opponent) => {
		const cards = player.deck
			.filter(c => util.getCardInfo(c, player, opponent).colors(util, c, player, opponent).includes("purple"))
			.filter(c => c.id != card.id)
		if (cards.length == 0) return null;
		return () => {
			util.destroy(util.sample(cards).id, player, opponent);
			for (const card of [...player.deck, ...player.board, ...opponent.deck, ...opponent.board]) {
				card.revealed = false;
			}
		}
	}
}