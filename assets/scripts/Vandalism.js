// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Additional cost: activate N orange agents. Remove a location with rank up to N-2.",
	type: () => "operation",
	colors: () => ["orange"],
	cost: () => ({ money: 20 }),
	rank: () => 2,
	playChoice: (util, card, player, opponent) => (cc) => {
		const removeTargets = util.filter([...opponent.deck, ...opponent.board], "revealed location", player, opponent);
		const activateTargets = util.filter(player.board, "refreshed orange agent", player, opponent);
		removeTargets.sort((a, b) => {
			const aRank = util.getCardInfo(a, player, opponent).rank(util, a, player, opponent);
			const bRank = util.getCardInfo(b, player, opponent).rank(util, b, player, opponent);
			return aRank - bRank;
		});
		return util.chooseTargets(removeTargets.map(c => c.id), 1, false, (remove) => {
			if (remove == null) return cc(null);
			const state = util.getCardState(remove[0], player, opponent);
			const rank = util.getCardInfo(state, player, opponent).rank(util, state, player, opponent);
			return util.chooseTargets(activateTargets.map(c => c.id), rank + 2, false, (activate) => {
				if (activate == null) return cc(null);
				return cc({ targets: { remove, activate } });
			});
		});
	},
	play: (util, card, player, opponent) => (choice) => {
		const state = util.getCardState(choice.targets.remove[0], player, opponent);
		const rank = util.getCardInfo(state, player, opponent).rank(util, state, player, opponent);
		for (let i = 0; i < rank + 2; i++) {
			util.activate(choice.targets.activate[i], player, opponent);
		}
		util.remove(choice.targets.remove[0], player, opponent);
	}
}