// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Additional cost: activate a purple agent. Destroy an agent.",
	type: () => "operation",
	colors: () => ["purple"],
	cost: () => ({ money: 30, agents: { purple: 1 } }),
	rank: () => 1,
	playChoice: (util, card, player, opponent) => (cc) => {
		const destroyTargets = util.filter([...opponent.deck, ...opponent.board], "revealed agent", player, opponent);
		return util.chooseTargets(destroyTargets.map(c => c.id), 1, false, (destroy) => {
			if (destroy == null) return cc(null);
			return cc({ targets: { destroy } });
		});
	},
	play: (util, card, player, opponent) => (choice) => {
		util.destroy(choice.targets.destroy[0], player, opponent);
	}
}