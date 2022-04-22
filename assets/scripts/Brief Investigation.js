// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Reveal two cards in your opponent's deck.",
	type: () => "operation",
	colors: () => [],
	cost: () => ({ money: 10}),
	rank: () => 1,
	play: (util, card, player, opponent) => () => {
		util.revealRandom(opponent.deck, player, opponent);
		util.revealRandom(opponent.deck, player, opponent);
	}
}