// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Additional cost: activate a purple agent. Destroy an agent and all agents on your opponent's board with the same name.",
	type: () => "operation",
	colors: () => ["purple"],
	cost: () => ({ money: 60, agents: { purple: 1 } }),
	rank: () => 2,
	playChoice: (util, card, player, opponent) => (cc) => {
		const destroyTargets = util.filter([...opponent.deck, ...opponent.board], "revealed agent", player, opponent);
		return util.chooseTargets(destroyTargets.map(c => c.id), 1, false, (destroy) => {
			if (destroy == null) return cc(null);
			return cc({ targets: { destroy } });
		});
	},
	play: (util, card, player, opponent) => (choice) => {
		const target = util.getCardState(choice.targets.destroy[0], player, opponent);
		for (const card of opponent.board) {
			if (card.name == target.name) {
				util.destroy(card.id, player, opponent);
			}
		}
	}
}