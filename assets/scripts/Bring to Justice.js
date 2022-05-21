// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Additional cost: activate two blue agents. Remove a rank 1 or 2 agent.",
	type: () => "operation",
	colors: () => ["blue"],
	cost: () => ({ money: 20, agents: { blue: 2 } }),
	rank: () => 2,
	playChoice: (util, card, player, opponent) => (cc) => {
		const removeTargets = util.filter([...opponent.deck, ...opponent.board], "revealed agent rank/1/2", player, opponent);
		return util.chooseTargets(removeTargets.map(c => c.id), 1, false, (remove) => {
			if (remove == null) return cc(null);
			return cc({ targets: { remove } });
		});
	},
	play: (util, card, player, opponent) => (choice) => {
		util.remove(choice.targets.remove[0], player, opponent);
	}
}