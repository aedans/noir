// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Activate this: destroy one of your opponent's operations.",
	type: () => "agent",
	colors: () => ["blue"],
	cost: () => ({ money: 95 }),
	rank: () => 3,
	useChoice: (util, card, player, opponent) => (cc) => {
		const destroyTargets = util.filter([...opponent.deck, ...opponent.board], "revealed operation", player, opponent);
		return util.chooseTargets(destroyTargets.map(c => c.id), 1, false, (destroy) => {
			if (destroy == null) return cc(null);
			return cc({ targets: { destroy } });
		});
	},
	use: (util, card, player, opponent) => (choice) => {
		util.destroy(choice.targets.destroy[0], player, opponent);
	}
}