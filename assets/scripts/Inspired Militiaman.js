// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "This costs $5 less for each revealed orange agent on your board.",
	type: () => "agent",
	colors: () => ["orange"],
	cost: (util, card, player, opponent) => {
		const cards = player.board
			.filter(c => util.getCardInfo(c, player, opponent).colors(util, c, player, opponent).includes("orange"))
			.filter(c => util.getCardInfo(c, player, opponent).type(util, c, player, opponent) == "agent")
			.filter(c => c.revealed);
		return { money: Math.max(0, 40 - 5 * cards.length) };
	},
	rank: () => 1,
	play: () => () => {}
}