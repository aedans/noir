// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Additional cost: activate a green agent. In three turns, gain $60",
	type: () => "operation",
	colors: () => ["green"],
	cost: () => ({ money: 15, agents: { green: 1 } }),
	rank: () => 1,
	play: (util, card, player, opponent) => () => {
		card.number.turns = 0;
		player.board.push(card);
	},
	turn: (util, card, player, opponent) => {
		card.number.turns++;
		if (card.number.turns == 3) {
			player.money += 60;
			util.destroy(card.id, player, opponent);
		}
	}
}