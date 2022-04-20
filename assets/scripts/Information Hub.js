// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Activate this and an agent, pay $10: reveal a card on your opponent's board.",
	type: () => "location",
	colors: () => [],
	cost: () => ({ money: 25 }),
	rank: () => 1,
	useCost: () => ({ money: 10, agents: { any: 1 } }),
	use: (util, card, player, opponent) => () => {
		util.revealRandom(opponent.board, player, opponent);
	}
}