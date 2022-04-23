// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Activate this and an agent: gain $15.",
	type: () => "location",
	colors: () => [],
	cost: () => ({ money: 40 }),
	rank: () => 2,
	useCost: () => ({ money: 0, agents: { any: 1 }}),
	use: (util, card, player, opponent) => () => {
		player.money += 15;
	}
}