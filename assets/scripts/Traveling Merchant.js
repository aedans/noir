// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Whenever this is activated, gain $5.",
	type: () => "agent",
	colors: () => ["green"],
	cost: () => ({ money: 40 }),
	rank: () => 1,
	activate: (util, card, player, opponent) => {
		player.money += 5;
	}
}