// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "You can see the number of agents your opponent has.",
	type: () => "location",
	colors: () => [],
	cost: () => ({ money: 30 }),
	rank: () => 1,
	play: (util, card) => () => card.modifiers.push({ name: "surveying", card: util.cloneDeep(card) }),
	update: {
		board: (util, card, player, opponent) => {
			card.number.opponentGuys = opponent.board
				.filter(c => util.getCardInfo(c, player, opponent).type(util, c, player, opponent) == "agent")
				.length;
		}
	},
	modifiers: {
		surveying: (card) => ({
			...card,
			text: (util, state, player, opponent) => `${card.text(util, state, player, opponent)}\nOpponent's agents: ${state.number.opponentGuys}`
		})
	}
}