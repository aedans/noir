// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Each turn: destroy another revealed agent.",
	type: () => "agent",
	colors: () => ["purple"],
	cost: () => ({ money: 80 }),
	rank: () => 3,
	turn: (util, card, player, opponent) => {
		const random = util.sample(util.filter([...player.deck, ...player.board, ...opponent.deck, ...opponent.board], "revealed agent", player, opponent)
			.filter(c => c.id != card.id));
		if (random) {
			util.destroy(random.id, player, opponent);
			util.reveal(card.id, player, opponent);
		}
	},
}