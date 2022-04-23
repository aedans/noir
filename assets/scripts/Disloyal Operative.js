// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "When this is destroyed, destroy an agent in your deck.",
	type: () => "agent",
	colors: () => ["purple"],
	cost: () => ({ money: 20 }),
	rank: () => 1,
	destroy: (util, card, player, opponent) => {
		if (player.board.find(c => c.id == card.id) != null) {
			util.destroyRandom(util.filter(player.deck, "agent", player, opponent), player, opponent);
		}
	}
}