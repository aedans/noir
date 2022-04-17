// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Additional cost: activate two orange agents. Reveal two cards from your opponent's deck.",
	type: () => "operation",
	colors: () => ["orange"],
	cost: () => ({ money: 0, agents: { orange: 2 } }),
	rank: () => 1,
	play: (util, card, player, opponent) => () => {
		util.revealRandom(opponent.deck, player, opponent);
		util.revealRandom(opponent.deck, player, opponent);
	}
}