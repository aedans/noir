// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Activate this and an agent: destroy a revealed card and refresh this.",
	type: () => "location",
	colors: () => [],
	cost: () => ({ money: 120 }),
	rank: () => 3,
	useCost: () => ({ money: 0, agents: { any: 1 } }),
	useChoice: (util, card, player, opponent) => (cc) => {
		const destroyTargets = [...opponent.deck, ...opponent.board].filter(c => c.revealed == true);
		return util.chooseTargets(destroyTargets.map(c => c.id), 1, false, (destroy) => {
			if (destroy == null) return cc(null);
			return cc({ targets: { destroy } });
		});
	},
	use: (util, card, player, opponent) => (choice) => {
		util.destroy(choice.targets.destroy[0], player, opponent);
		card.activated = false;
	}
}