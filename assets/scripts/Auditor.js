// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "You can see how much money your opponent has.",
	type: () => "agent",
	colors: () => ["blue"],
	cost: () => ({ money: 50 }),
	rank: () => 2,
	play: (util, card) => () => card.modifiers.push({ name: "auditing", card: card.id }),
	update: (util, card, player, opponent) => {
		if (player.board.find(c => c.id == card.id)) {
			card.number.opponentMoney = opponent.money
		}
	},
	modifiers: {
		auditing: (info) => ({
			...info,
			text: (util, card, player, opponent) => `${info.text(util, card, player, opponent)}\nOpponent's money: $${card.number.opponentMoney}`
		})
	}
}