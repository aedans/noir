// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Activate and remove this: gain $60.",
	type: () => "agent",
	colors: () => ["green"],
	cost: () => ({ money: 40 }),
	rank: () => 1,
	useCost: () => ({ money: 0 }),
	use: (util, card, player, opponent) => () => {
		util.activate(card.id, player, opponent);
		util.remove(card.id, player, opponent);
		player.money += 60;
	}
}