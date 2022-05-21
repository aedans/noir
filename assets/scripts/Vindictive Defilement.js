// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Additional cost: activate two purple agents. remove a location and remove agents in your deck equal to its rank.",
	type: () => "operation",
	colors: () => ["purple"],
	cost: () => ({ money: 25, agents: { purple: 2 } }),
	rank: () => 2,
	playChoice: (util, card, player, opponent) => (cc) => {
		const removeTargets = util.filter([...opponent.deck, ...opponent.board], "revealed location", player, opponent);
		return util.chooseTargets(removeTargets.map(c => c.id), 1, false, (remove) => {
			if (remove == null) return cc(null);
			return cc({ targets: { remove } });
		});
	},
	play: (util, card, player, opponent) => (choice) => {
		const state = util.getCardState(choice.targets.remove[0], player, opponent);
		const rank = util.getCardInfo(state, player, opponent).rank(util, card, player, opponent);
		util.remove(choice.targets.remove[0], player, opponent);
		for (let i = 0; i < rank; i++) {
			util.removeRandom(util.filter(player.deck, "agent", player, opponent), player, opponent);
		}
	}
}