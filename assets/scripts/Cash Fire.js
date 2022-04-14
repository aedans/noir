// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Additional cost: activate five orange agents and reveal all orange agents from your deck. Set each player's money equal to $0.",
	type: () => "operation",
	colors: () => ["orange"],
	cost: () => ({ money: 0 }),
	rank: () => 3,
	playChoice: (util, card, player, opponent) => (cc) => {
		const activateTargets = player.board
			.filter(c => util.getCardInfo(c, player, opponent).colors(util, c, player, opponent).includes("orange"))
			.filter(c => util.getCardInfo(c, player, opponent).type(util, card, player, opponent) == "agent")
			.filter(c => c.activated == false);
		return util.chooseTargets(activateTargets.map(c => c.id), 5, false, (activate) => {
			if (activate == null) return cc(null);
			return cc({ targets: { activate } });
		});
	},
	play: (util, card, player, opponent) => (choice) => {
		for (let i = 0; i < 5; i++) {
			util.activate(choice.targets.activate[i], player, opponent);
		}

		const agents = player.deck
			.filter(c => util.getCardInfo(c, player, opponent).colors(util, c, player, opponent).includes("orange"))
			.filter(c => util.getCardInfo(c, player, opponent).type(util, c, player, opponent) == "agent")
			.filter(c => !c.revealed);
		for (const agent of agents) {
			util.reveal(agent.id, player, opponent);
		}

		player.money = 0;
		opponent.money = 0;
	}
}