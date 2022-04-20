// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Pay $20 times the rank of the target, activate this: destroy an agent.",
	type: () => "agent",
	colors: () => ["purple"],
	cost: () => ({ money: 55}),
	rank: () => 2,
	useChoice: (util, card, player, opponent) => (cc) => {
		const maxRank = player.money / 20;
		const destroyTargets = [...opponent.deck, ...opponent.board]
			.filter(c => util.getCardInfo(c, player, opponent).type(util, c, player, opponent) == "agent")
			.filter(c => util.getCardInfo(c, player, opponent).rank(util, c, player, opponent) < maxRank)
			.filter(c => c.revealed == true);
		destroyTargets.sort((a, b) => {
			const aRank = util.getCardInfo(a, player, opponent).rank(util, a, player, opponent);
			const bRank = util.getCardInfo(b, player, opponent).rank(util, b, player, opponent);
			return aRank - bRank;
		})
		return util.chooseTargets(destroyTargets.map(c => c.id), 1, false, (destroy) => {
			if (destroy == null) return cc(null);
			return cc({ targets: { destroy } });
		});
	},
	use: (util, card, player, opponent) => (choice) => {
		const state = util.getCardState(choice.targets.destroy[0], player, opponent);
		const rank = util.getCardInfo(state, player, opponent).rank(util, state, player, opponent);
		player.money -= rank * 20;
		util.destroy(choice.targets.destroy[0], player, opponent);
	}
}