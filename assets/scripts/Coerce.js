// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Additional cost: activate two orange agents. Reveal two cards from your opponent's deck.",
	type: () => "operation",
	colors: () => ["orange"],
	cost: () => ({ money: 0}),
	rank: () => 1,
	playChoice: (util, card, player, opponent) => (cc) => {
		const activateTargets = player.board
			.filter(c => util.getCardInfo(c, player, opponent).colors(util, c, player, opponent).includes("orange"))
			.filter(c => util.getCardInfo(c, player, opponent).type(util, card, player, opponent) == "agent")
			.filter(c => c.used == false);
		return util.chooseTargets(activateTargets.map(c => c.id), 2, false, (activate) => {
			if (activate == null) return cc(null);
			return cc({ targets: { activate } });
		});
	},
	play: (util, card, player, opponent) => (choice) => {
		util.activate(choice.targets.activate[0], player, opponent);
		util.activate(choice.targets.activate[1], player, opponent);
		util.revealOne(opponent.deck, player, opponent);
		util.revealOne(opponent.deck, player, opponent);
	}
}