// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Additional cost: activate N orange agents. Destroy a location with rank up to N-2.",
	type: () => "operation",
	colors: () => ["orange"],
	cost: () => ({ money: 20 }),
	rank: () => 2,
	playChoice: (util, card, player, opponent) => (cc) => {
		const destroyTargets = [...opponent.deck, ...opponent.board]
			.filter(c => util.getCardInfo(c, player, opponent).type(util, card, player, opponent) == "location")
			.filter(c => c.revealed == true);
		const activateTargets = player.board
			.filter(c => util.getCardInfo(c, player, opponent).colors(util, c, player, opponent).includes("orange"))
			.filter(c => util.getCardInfo(c, player, opponent).type(util, card, player, opponent) == "agent")
			.filter(c => c.activated == false);
		destroyTargets.sort((a, b) => {
			const aRank = util.getCardInfo(a, player, opponent).rank(util, a, player, opponent);
			const bRank = util.getCardInfo(b, player, opponent).rank(util, b, player, opponent);
			return aRank - bRank;
		});
		return util.chooseTargets(destroyTargets.map(c => c.id), 1, false, (destroy) => {
			if (destroy == null) return cc(null);
			const state = util.getCardState(destroy[0], player, opponent);
			const rank = util.getCardInfo(state, player, opponent).rank(util, state, player, opponent);
			return util.chooseTargets(activateTargets.map(c => c.id), rank + 2, false, (activate) => {
				if (activate == null) return cc(null);
				return cc({ targets: { destroy, activate } });
			});
		});
	},
	play: (util, card, player, opponent) => (choice) => {
		const state = util.getCardState(choice.targets.destroy[0], player, opponent);
		const rank = util.getCardInfo(state, player, opponent).rank(util, state, player, opponent);
		for (let i = 0; i < rank + 2; i++) {
			util.activate(choice.targets.activate[i], player, opponent);
		}
		util.destroy(choice.targets.destroy[0], player, opponent);
	}
}