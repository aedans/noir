// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Additional cost: activate a blue agent. Reveal three rank 1 cards in your opponent's deck.",
	type: () => "operation",
	colors: () => ["blue"],
	cost: () => ({ money: 5 }),
	rank: () => 1,
	playChoice: (util, card, player, opponent) => (cc) => {
		const activateTargets = player.board
			.filter(c => util.getCardInfo(c, player, opponent).colors(util, c, player, opponent).includes("blue"))
			.filter(c => util.getCardInfo(c, player, opponent).type(util, card, player, opponent) == "agent")
			.filter(c => c.used == false);
		return util.chooseTargets(activateTargets.map(c => c.id), 1, false, (activate) => {
			if (activate == null) return cc(null);
			return cc({ targets: { activate } });
		});
	},
	play: (util, card, player, opponent) => (choice) => {
		util.activate(choice.targets.activate[0], player, opponent);
		const cards = opponent.deck.filter(c => util.getCardInfo(c, player, opponent).rank(util, c, player, opponent) <= 1);
		for (let i = 0; i < 3; i++) {
			util.revealOne(cards, player, opponent);
		}
	},
}