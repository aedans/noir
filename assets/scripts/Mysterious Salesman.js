// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Activate this, pay $30: either reveal three random cards of your opponent or destroy three random cards of your opponent, chosen at random.",
	type: () => "agent",
	colors: () => [],
	cost: () => ({ money: 50 }),
	rank: () => 2,
	useCost: () => ({ money: 30 }),
	use: (util, card, player, opponent) => () => {
		util.sample([
			() => {
				for (let i = 0; i < 3; i++) {
					util.revealRandom([...opponent.deck, ...opponent.board], player, opponent);
				}
			},
			() => {
				for (let i = 0; i < 3; i++) {
					util.destroyRandom([...opponent.deck, ...opponent.board], player, opponent);
				}
			}
		])();
	}
}