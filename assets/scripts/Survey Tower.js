// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "You can see the number of agents your opponent has.",
	type: () => "location",
	colors: () => [],
	cost: () => ({ money: 30 }),
	rank: () => 1,
	play: (util, card) => () => card.modifiers.push({ name: "surveying", card: card.id }),
	update: {
		board: (util, card, player, opponent) => {
			card.number.opponentGuys = opponent.board
				.filter(c => util.getCardInfo(c, player, opponent).type(util, c, player, opponent) == "agent")
				.length;
		}
	},
	modifiers: {
		surveying: (info) => ({
			...info,
			text: (util, card, player, opponent) => `${info.text(util, card, player, opponent)}\nOpponent's agents: ${card.number.opponentGuys}`
		})
	}
}