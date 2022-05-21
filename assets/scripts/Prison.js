// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Activate this and a blue agent: remove one of your opponent's agents.",
	type: () => "location",
	colors: () => ["blue"],
	cost: () => ({ money: 65 }),
	rank: () => 2,
	useCost: () => ({ money: 0, agents: { blue: 1 } }),
	useChoice: (util, card, player, opponent) => (cc) => {
		const removeTargets = util.filter([...opponent.deck, ...opponent.board], "revealed agent", player, opponent);
		return util.chooseTargets(removeTargets.map(c => c.id), 1, false, (remove) => {
			if (remove == null) return cc(null);
			return cc({ targets: { remove } });
		});
	},
	use: (util, card, player, opponent) => (choice) => {
		util.remove(choice.targets.remove[0], player, opponent);
	}
}