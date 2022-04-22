// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "When this is destroyed, destroy an agent in your deck.",
	type: () => "agent",
	colors: () => ["purple"],
	cost: () => ({ money: 20 }),
	rank: () => 1,
	destroy: (util, card, player, opponent) => {
		util.destroyRandom(util.filter(player.deck, "agent", player, opponent), player, opponent);
	}
}