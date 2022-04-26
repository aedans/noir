// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Activate this, pay $40: either reveal four random cards of your opponent or destroy two random revealed cards of your opponent, chosen at random.",
	type: () => "agent",
	colors: () => [],
	cost: () => ({ money: 60 }),
	rank: () => 2,
	useCost: () => ({ money: 30 }),
	use: (util, card, player, opponent) => () => {
		util.sample([
			() => {
				for (let i = 0; i < 4; i++) {
					util.revealRandom([...opponent.deck, ...opponent.board], player, opponent);
				}
			},
			() => {
				for (let i = 0; i < 2; i++) {
					util.destroyRandom(util.filter([...opponent.deck, ...opponent.board], "revealed", player, opponent), player, opponent);
				}
			}
		])();
	}
}