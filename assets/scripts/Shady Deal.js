// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Additional cost: destroy an agent in your deck. Next turn, gain $40.",
	type: () => "operation",
	colors: () => [],
	cost: () => ({ money: 10 }),
	rank: () => 1,
	play: (util, card, player, opponent) => () => {
		const cards = player.deck.filter(c => util.getCardInfo(c, player, opponent).type(util, c, player, opponent) == "agent");
		util.destroyRandom(cards, player, opponent);
		player.board.push(card);
	},
	
	turn: {
		board: (util, card, player, opppnent) => {
			util.destroy(card.id, player, opppnent);
			player.money += 40;
		}
	}
}