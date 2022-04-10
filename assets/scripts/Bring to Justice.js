exports.card = {
	text: () => "Additional cost: activate two blue agents. Destroy a rank 1 or 2 agent.",
	type: () => "operation",
	colors: () => ["blue"],
	cost: () => ({ money: 20 }),
	rank: () => 2,
	playChoice: (util, card, player, opponent) => (cc) => {
		const activateTargets = player.board
			.filter(c => util.getCardInfo(c, player, opponent).colors(util, c, player, opponent).includes("blue"))
			.filter(c => util.getCardInfo(c, player, opponent).type(util, card, player, opponent) == "agent")
			.filter(c => c.used == false);
		const destroyTargets = [...opponent.deck, ...opponent.board]
			.filter(c => util.getCardInfo(c, player, opponent).type(util, card, player, opponent) == "agent")
			.filter(c => util.getCardInfo(c, player, opponent).rank(util, card, player, opponent) <= 2)
			.filter(c => c.revealed == true);
		return util.chooseTargets(activateTargets.map(c => c.id), 2, false, (activate) => {
			if (activate == null) return cc(null);
			return util.chooseTargets(destroyTargets.map(c => c.id), 1, false, (destroy) => {
				if (destroy == null) return cc(null);
				return cc({ targets: { activate, destroy } });
			});
		});
	},
	play: (util, card, player, opponent) => (choice) => {
		util.activate(choice.targets.activate[0], player, opponent);
		util.activate(choice.targets.activate[1], player, opponent);
		util.destroy(choice.targets.destroy[0], player, opponent);
	}
}