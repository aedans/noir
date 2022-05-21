// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Additional cost: activate a blue agent. Remove up to three operations",
	type: () => "operation",
	colors: () => ["blue"],
	cost: () => ({ money: 25, agents: { blue: 1 } }),
	rank: () => 1,
	playChoice: (util, card, player, opponent) => (cc) => {
		const removeTargets = util.filter([...opponent.deck, ...opponent.board], "revealed operation", player, opponent);
		return util.chooseTargets(removeTargets.map(c => c.id), 3, true, (remove) => {
			if (remove == null) return cc(null);
			return cc({ targets: { remove } });
		});
	},
	play: (util, card, player, opponent) => (choice) => {
		for (let i = 0; i < 3 && i < choice.targets.remove.length; i++) {
			util.remove(choice.targets.remove[i], player, opponent);
		}
	}
}