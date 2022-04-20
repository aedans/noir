// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Each turn: another revealed agent becomes colorless.",
	type: () => "agent",
	colors: () => [],
	cost: () => ({ money: 50 }),
	rank: () => 3,
	turn: {
		board: (util, card, player, opponent) => {
			const random = util.sample([...player.deck, ...player.board, ...opponent.deck, ...opponent.board]
				.filter(c => util.getCardInfo(c, player, opponent).type(util, c, player, opponent) == "agent")
				.filter(c => c.id != card.id)
				.filter(c => c.revealed));
			random.modifiers.push({ name: "colorless", card: card.id });
		}
	},
	modifiers: {
		colorless: (info) => ({
			...info,
			colors: () => []
		})
	}
}