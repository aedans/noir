// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "After two turns, steal $50 from your opponent.",
	type: () => "agent",
	colors: () => ["purple"],
	cost: () => ({ money: 60 }),
	rank: () => 2,
	play: (util, card, player, opponent) => () => {
		card.number.turns = 0;
	},
	turn: (util, card, player, opponent) => {
		card.number.turns++;
		if (card.number.turns == 2) {
			if (opponent.money < 50) {
				player.money += opponent.money;
				opponent.money = 0;
			} else {
				opponent.money -= 50;
				player.money += 50;
			}
		}
	}
}