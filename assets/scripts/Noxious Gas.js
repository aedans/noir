// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Additional cost: activate a purple agent. remove an agent and all agents on your opponent's board with the same name.",
	type: () => "operation",
	colors: () => ["purple"],
	cost: () => ({ money: 60, agents: { purple: 1 } }),
	rank: () => 2,
	playChoice: (util, card, player, opponent) => (cc) => {
		const removeTargets = util.filter([...opponent.deck, ...opponent.board], "revealed agent", player, opponent);
		return util.chooseTargets(removeTargets.map(c => c.id), 1, false, (remove) => {
			if (remove == null) return cc(null);
			return cc({ targets: { remove } });
		});
	},
	play: (util, card, player, opponent) => (choice) => {
		const target = util.getCardState(choice.targets.remove[0], player, opponent);
		for (const card of opponent.board) {
			if (card.name == target.name) {
				util.remove(card.id, player, opponent);
			}
		}
	}
}