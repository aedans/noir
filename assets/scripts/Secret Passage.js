// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Each turn: a revealed agent on your board becomes hidden.",
	type: () => "location",
	colors: () => [],
	cost: () => ({ money: 50}),
	rank: () => 3,
	turn: {
		board: (util, card, player, opponent) => {
			const cards = player.board.filter(c => c.revealed);
			if (cards.length > 0) {
				util.sample(cards).revealed = false;
			}
		}
	}
}