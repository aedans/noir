// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Reveal cards from your opponent's deck equal to the number of purple agents on your board.",
	type: () => "operation",
	colors: () => ["purple"],
	cost: () => ({ money: 10 }),
	rank: () => 2,
	play: (util, card, player, opponent) => () => {
		const agents = player.board
			.filter(c => util.getCardInfo(c, player, opponent).type(util, c, player, opponent) == "agent")
			.filter(c => util.getCardInfo(c, player, opponent).colors(util, c, player, opponent).includes("purple"));
		for (const agent of agents) {
			util.revealRandom(opponent.deck, player, opponent);
		}
	}
}