// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Additional cost: activate a purple agent. Remove an agent.",
	type: () => "operation",
	colors: () => ["purple"],
	cost: () => ({ money: 30, agents: { purple: 1 } }),
	rank: () => 1,
	playChoice: (util, card, player, opponent) => (cc) => {
		const removeTargets = util.filter([...opponent.deck, ...opponent.board], "revealed agent", player, opponent);
		return util.chooseTargets(removeTargets.map(c => c.id), 1, false, (remove) => {
			if (remove == null) return cc(null);
			return cc({ targets: { remove } });
		});
	},
	play: (util, card, player, opponent) => (choice) => {
		util.remove(choice.targets.remove[0], player, opponent);
	}
}