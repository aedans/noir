// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Additional cost: activate a blue agent. Remove up to three operations",
	type: () => "operation",
	colors: () => ["blue"],
	cost: () => ({ money: 25, agents: { blue: 1 } }),
	rank: () => 1,
	playChoice: (util, card, player, opponent) => (cc) => {
		const destroyTargets = util.filter([...opponent.deck, ...opponent.board], "revealed operation", player, opponent);
		return util.chooseTargets(destroyTargets.map(c => c.id), 3, true, (destroy) => {
			if (destroy == null) return cc(null);
			return cc({ targets: { destroy } });
		});
	},
	play: (util, card, player, opponent) => (choice) => {
		for (let i = 0; i < 3 && i < choice.targets.destroy.length; i++) {
			util.destroy(choice.targets.destroy[i], player, opponent);
		}
	}
}