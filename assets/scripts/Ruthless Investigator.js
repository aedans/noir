// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Whenever this is activated, reveal a card in your opponent's deck.",
	type: () => "agent",
	colors: () => ["blue"],
	cost: () => ({ money: 50 }),
	rank: () => 1,
	activate: (util, card, player, opponent) => {
		util.revealRandom(opponent.deck, player, opponent);
	}
}