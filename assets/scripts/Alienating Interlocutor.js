// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Each turn: another revealed agent becomes colorless.",
	type: () => "agent",
	colors: () => [],
	cost: () => ({ money: 50 }),
	rank: () => 3,
	turn: (util, card, player, opponent) => {
		const random = util.sample(util.filter([...player.deck, ...player.board, ...opponent.deck, ...opponent.board], "revealed agent", player, opponent)
			.filter(c => c.id != card.id));
		if (random != null) {
			random.modifiers.push({ name: "colorless", card: card.id });
			util.reveal(card.id, player, opponent);
		}
	},
	modifiers: {
		colorless: (info) => ({
			...info,
			colors: () => []
		})
	}
}