// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Additional cost: activate a green agent. Next turn, gain $25.",
	type: () => "operation",
	colors: () => ["green"],
	cost: () => ({ money: 5, agents: { green: 1 } }),
	rank: () => 1,
	play: (util, card, player, opponent) => () => {
		player.board.push(card);
	},
	turn: {
		board: (util, card, player, opponent) => {
			util.destroy(card.id, player, opponent);
			player.money += 25;
		}
	}
}