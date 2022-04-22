// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "This costs $5 less for each revealed orange agent on your board.",
	type: () => "agent",
	colors: () => ["orange"],
	cost: (util, card, player, opponent) => {
		const cards = util.filter(player.board, "revealed orange agent", player, opponent);
		return { money: Math.max(0, 40 - 5 * cards.length) };
	},
	rank: () => 1,
	play: () => () => {}
}