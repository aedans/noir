// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Gain $40 the turn after you play this. Each subsequent turn, lose $5.",
	type: () => "location",
	colors: () => [],
	cost: () => ({ money: 20 }),
	rank: () => 2,
	play: (util, card, player, opponent) => () => card.number.turn = 0,
	turn: (util, card, player, opponent) => {
		card.number.turn++;
		if (card.number.turn == 1) {
			player.money += 40;
		} else if (card.number.turn > 1) {
			player.money -= 5;
		}
	}
}