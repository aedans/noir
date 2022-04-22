// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "When you play this, hide it. Each turn: a revealed agent on your board becomes hidden.",
	type: () => "location",
	colors: () => [],
	cost: () => ({ money: 50 }),
	rank: () => 3,
	play: (util, card, player, opponent) => () => {
		card.revealed = false;
	},
	turn: (util, card, player, opponent) => {
		const cards = player.board
			.filter(c => util.getCardInfo(c, player, opponent).type(util, c, player, opponent) == "agent")
			.filter(c => c.revealed);
		if (cards.length > 0) {
			util.sample(cards).revealed = false;
		}
	}
}