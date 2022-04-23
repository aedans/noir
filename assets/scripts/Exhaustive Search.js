// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Additional cost: activate three blue agents and destroy three operations in your deck. Reveal eight agents from your opponent's deck.",
	type: () => "operation",
	colors: () => ["blue"],
	cost: () => ({ money: 75, agents: { blue: 3 } }),
	rank: () => 2,
	play: (util, card, player, opponent) => {
		const cards = util.filter(player.deck, "operation", player, opponent);
		if (cards.length < 3) return null;
		return () => {
			for (let i = 0; i < 3; i++) {
				util.destroyRandom(cards, player, opponent);
			}

			for (let i = 0; i < 8; i++) {
				util.revealRandom(opponent.deck, player, opponent);
			}
		}
	}
}