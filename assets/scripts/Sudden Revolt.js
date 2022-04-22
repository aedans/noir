// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Additional cost: activate any number of orange agents: destroy that many cards on board.",
	type: () => "operation",
	colors: () => ["orange"],
	cost: () => ({ money: 30 }),
	rank: () => 2,
	playChoice: (util, card, player, opponent) => (cc) => {
		const destroyTargets = util.filter(opponent.board, "revealed", player, opponent);
		const activateTargets = util.filter(player.board, "refreshed orange agent", player, opponent);
		const number = Math.min(activateTargets.length, destroyTargets.length);
		return util.chooseTargets(destroyTargets.map(c => c.id), number, true, (destroy) => {
			if (destroy == null) return cc(null);
			return util.chooseTargets(activateTargets.map(c => c.id), number, false, (activate) => {
				if (activate == null) return cc(null);
				return cc({ targets: { destroy, activate } });
			});
		});
	},
	play: (util, card, player, opponent) => (choice) => {
		for (let i = 0; i < choice.targets.activate.length; i++) {
			util.activate(choice.targets.activate[i], player, opponent);
			util.destroy(choice.targets.destroy[i], player, opponent);
		}
	}
}