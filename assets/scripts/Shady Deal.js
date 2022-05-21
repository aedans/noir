// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Additional cost: remove an agent in your deck. Next turn, gain $40.",
	type: () => "operation",
	colors: () => [],
	cost: () => ({ money: 10 }),
	rank: () => 1,
	play: (util, card, player, opponent) => () => {
		const cards = util.filter(player.deck, "agent", player, opponent);
		util.removeRandom(cards, player, opponent);
		player.board.push(card);
	},
	turn: (util, card, player, opppnent) => {
		util.remove(card.id, player, opppnent);
		player.money += 40;
	}
}