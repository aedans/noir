// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Remove a location.",
	type: () => "operation",
	colors: () => [],
	cost: () => ({ money: 90 }),
	rank: () => 2,
	playChoice: (util, card, player, opponent) => (cc) => {
		const removeTargets = util.filter([...opponent.deck, ...opponent.board], "revealed location", player, opponent);
		return util.chooseTargets(removeTargets.map(c => c.id), 1, false, (remove) => {
			if (remove == null) return cc(null);
			return cc({ targets: { remove } });
		});
	},
	play: (util, card, player, opponent) => (choice) => {
		util.remove(choice.targets.remove[0], player, opponent);
	}
}