// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "You can see the number of agents your opponent has.",
	type: () => "location",
	colors: () => [],
	cost: () => ({ money: 30 }),
	rank: () => 1,
	play: (util, card) => () => card.modifiers.push({ name: "surveying", card: card.id }),
	update: (util, card, player, opponent) => {
		if (player.board.find(c => c.id == card.id)) {
			card.number.opponentAgents = util.filter(opponent.board, "agent", player, opponent).length;
		}
	},
	modifiers: {
		surveying: (info) => ({
			...info,
			text: (util, card, player, opponent) => `${info.text(util, card, player, opponent)}\nOpponent's agents: ${card.number.opponentAgents}`
		})
	}
}