// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Destroy a location.",
	type: () => "operation",
	colors: () => [],
	cost: () => ({ money: 90 }),
	rank: () => 2,
	playChoice: (util, card, player, opponent) => (cc) => {
		const destroyTargets = util.filter([...opponent.deck, ...opponent.board], "revealed location", player, opponent);
		return util.chooseTargets(destroyTargets.map(c => c.id), 1, false, (destroy) => {
			if (destroy == null) return cc(null);
			return cc({ targets: { destroy } });
		});
	},
	play: (util, card, player, opponent) => (choice) => {
		util.destroy(choice.targets.destroy[0], player, opponent);
	}
}