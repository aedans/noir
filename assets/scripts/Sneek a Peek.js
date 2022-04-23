// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Additional cost: activate an orange agent. Reveal a card on your opponent's board and a card from their deck.",
	type: () => "operation",
	colors: () => ["orange"],
	cost: () => ({ money: 5, agents: { orange: 1 } }),
	rank: () => 1,
	play: (util, card, player, opponent) => () => {
		util.revealRandom(opponent.board, player, opponent);
		util.revealRandom(opponent.deck, player, opponent);
	}
}