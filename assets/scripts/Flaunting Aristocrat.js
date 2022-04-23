// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Each turn: if you have more than $50, reveal two cards in your opponent's deck.",
	type: () => "agent",
	colors: () => ["green"],
	cost: () => ({ money: 80}),
	rank: () => 2,
	turn: (util, card, player, opponent) => {
		if (player.money > 50) {
			util.revealRandom(opponent.deck, player, opponent);
			util.revealRandom(opponent.deck, player, opponent);
		}
	}
}