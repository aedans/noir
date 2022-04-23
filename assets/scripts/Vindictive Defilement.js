// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Additional cost: activate two purple agents. Destroy a location and destroy agents in your deck equal to its rank.",
	type: () => "operation",
	colors: () => ["purple"],
	cost: () => ({ money: 45, agents: { purple: 2 } }),
	rank: () => 2,
	playChoice: (util, card, player, opponent) => (cc) => {
		const destroyTargets = util.filter([...opponent.deck, ...opponent.board], "revealed location", player, opponent);
		return util.chooseTargets(destroyTargets.map(c => c.id), 1, false, (destroy) => {
			if (destroy == null) return cc(null);
			return cc({ targets: { destroy } });
		});
	},
	play: (util, card, player, opponent) => (choice) => {
		const state = util.getCardState(choice.targets.destroy[0], player, opponent);
		const rank = util.getCardInfo(state, player, opponent).rank(util, card, player, opponent);
		util.destroy(choice.targets.destroy[0], player, opponent);
		for (let i = 0; i < rank; i++) {
			util.destroyRandom(util.filter(player.deck, "agent", player, opponent), player, opponent);
		}
	}
}