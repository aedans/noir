// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Each turn: a revealed agent on your board becomes hidden.",
	type: () => "location",
	colors: () => [],
	cost: () => ({ money: 50 }),
	rank: () => 3,
	turn: (util, card, player, opponent) => {
		const cards = util.filter(player.board, "revealed agent", player, opponent);
		if (cards.length > 0) {
			util.sample(cards).revealed = false;
		}
	}
}