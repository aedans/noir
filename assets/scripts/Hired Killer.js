// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Pay $20 times the rank of the target, activate this: remove an agent.",
	type: () => "agent",
	colors: () => ["purple"],
	cost: () => ({ money: 55 }),
	rank: () => 2,
	useChoice: (util, card, player, opponent) => (cc) => {
		const maxRank = player.money / 20;
		const removeTargets = util.filter([...opponent.deck, ...opponent.board], "revealed agent", player, opponent)
			.filter(c => util.getCardInfo(c, player, opponent).rank(util, c, player, opponent) < maxRank);
		removeTargets.sort((a, b) => {
			const aRank = util.getCardInfo(a, player, opponent).rank(util, a, player, opponent);
			const bRank = util.getCardInfo(b, player, opponent).rank(util, b, player, opponent);
			return aRank - bRank;
		})
		return util.chooseTargets(removeTargets.map(c => c.id), 1, false, (remove) => {
			if (remove == null) return cc(null);
			return cc({ targets: { remove } });
		});
	},
	use: (util, card, player, opponent) => (choice) => {
		const state = util.getCardState(choice.targets.remove[0], player, opponent);
		const rank = util.getCardInfo(state, player, opponent).rank(util, state, player, opponent);
		player.money -= rank * 20;
		util.remove(choice.targets.remove[0], player, opponent);
	}
}