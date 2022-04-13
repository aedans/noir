// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Each turn: a random revealed agent becomes colorless.",
	type: () => "agent",
	colors: () => [],
	cost: () => ({ money: 60 }),
	rank: () => 3,
	turn: {
		board: (util, card, player, opponent) => {
			const random = util.sample([...player.deck, ...player.board, ...opponent.deck, ...opponent.board]
				.filter(c => util.getCardInfo(c, player, opponent).type(util, c, player, opponent) == "agent")
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