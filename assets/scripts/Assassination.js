// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Additional cost: activate an agent. Destroy an agent.",
	type: () => "operation",
	colors: () => [],
	cost: () => ({ money: 50 }),
	rank: () => 1,
	playChoice: (util, card, player, opponent) => (cc) => {
		const destroyTargets = [...opponent.deck, ...opponent.board]
			.filter(c => util.getCardInfo(c, player, opponent).type(util, card, player, opponent) == "agent")
			.filter(c => c.revealed == true);
		const activateTargets = player.board
			.filter(c => util.getCardInfo(c, player, opponent).type(util, card, player, opponent) == "agent")
			.filter(c => c.used == false);
		return util.chooseTargets(destroyTargets.map(c => c.id), 1, false, (destroy) => {
			if (destroy == null) return cc(null);
			return util.chooseTargets(activateTargets.map(c => c.id), 1, false, (activate) => {
				if (activate == null) return cc(null);
				return cc({ targets: { destroy, activate } });
			});
		});
	},
	play: (util, card, player, opponent) => (choice) => {
		util.activate(choice.targets.activate[0], player, opponent);
		util.destroy(choice.targets.destroy[0], player, opponent);
	}
}