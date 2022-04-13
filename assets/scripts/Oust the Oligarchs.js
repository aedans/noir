// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Additional cost: activate five orange agents. Destroy all revealed rank 3 agents you don't control.",
	type: () => "operation",
	colors: () => ["orange"],
	cost: () => ({ money: 20 }),
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
		
		const agents = [...opponent.board, ...opponent.deck]
			.filter(c => c.revealed)
			.filter(c => util.getCardInfo(c, player, opponent).rank(util, card, player, opponent) == 3)
			.filter(c => util.getCardInfo(c, player, opponent).type(util, card, player, opponent) == "agent");
		for (const agent of agents) {
			util.destroy(agent.id, player, opponent);
		}
	}
}