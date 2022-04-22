// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Activate this and an agent, reveal a hidden green card in your deck: gain $60.",
	type: () => "location",
	colors: () => ["green"],
	cost: () => ({ money: 150 }),
	rank: () => 3,
	useCost: () => ({ money: 0, agents: { any: 1 } }),
	use: (util, card, player, opponent) => {
		const cards = util.filter(player.deck, "hidden green", player, opponent);
		if (cards.length == 0) return null;
		return () => {
			util.revealRandom(cards, player, opponent);
			player.money += 60;
		}
	}
}