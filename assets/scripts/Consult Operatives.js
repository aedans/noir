// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Additional cost: activate a green agent. Reveal cards from your opponent's deck equal to the number of locations on your board.",
	type: () => "operation",
	colors: () => ["green"],
	cost: () => ({ money: 30, agents: { green: 1 } }),
	rank: () => 1,
	play: (util, card, player, opponent) => () => {
		for (const location of player.board.filter(c => util.getCardInfo(c, player, opponent).type(util, c, player, opponent) == "location")) {
			util.revealRandom(opponent.deck, player, opponent);
		}
	}
}