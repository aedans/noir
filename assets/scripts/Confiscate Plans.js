// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Additional cost: activate a blue agent. Destroy up to three operations",
	type: () => "operation",
	colors: () => ["blue"],
	cost: () => ({ money: 25 }),
	rank: () => 2,
	playChoice: (util, card, player, opponent) => (cc) => {
		const destroyTargets = [...opponent.deck, ...opponent.board]
			.filter(c => util.getCardInfo(c, player, opponent).type(util, card, player, opponent) == "operation")
			.filter(c => c.revealed == true);
		const activateTargets = player.board
			.filter(c => util.getCardInfo(c, player, opponent).colors(util, c, player, opponent).includes("blue"))
			.filter(c => util.getCardInfo(c, player, opponent).type(util, card, player, opponent) == "agent")
			.filter(c => c.activated == false);
		return util.chooseTargets(destroyTargets.map(c => c.id), 3, true, (destroy) => {
			if (destroy == null) return cc(null);
			return util.chooseTargets(activateTargets.map(c => c.id), 1, false, (activate) => {
				if (activate == null) return cc(null);
				return cc({ targets: { destroy, activate } });
			});
		});
	},
	play: (util, card, player, opponent) => (choice) => {
		util.activate(choice.targets.activate[0], player, opponent);
		for (let i = 0; i < 3 && i < choice.targets.destroy.length; i++) {
			util.destroy(choice.targets.destroy[i], player, opponent);
		}
	}
}