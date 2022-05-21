// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Whenever a purple agent in your deck is removed, put a hidden Random Citizen into your deck.",
	type: () => "agent",
	colors: () => ["purple"],
	cost: () => ({ money: 65 }),
	rank: () => 2,
	effects: {
		board: (util, card, player, opponent) => (info) => ({
			...info,
			remove: (util, card, player, opponent) => {
				(info.remove ?? (() => {}))(util, card, player, opponent);
				if (player.deck.find(c => c.id == card.id) != null && util.getCardInfo(card, player, opponent).colors(util, card, player, opponent).includes("purple")) {
					player.deck.push(util.defaultCardState("Random Citizen"));
				}
			}
		})
	}
}