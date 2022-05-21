// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Activate this and two agents: remove a revealed card and refresh this.",
	type: () => "location",
	colors: () => [],
	cost: () => ({ money: 100 }),
	rank: () => 3,
	useCost: () => ({ money: 0, agents: { any: 2 } }),
	useChoice: (util, card, player, opponent) => (cc) => {
		const removeTargets = [...opponent.deck, ...opponent.board].filter(c => c.revealed == true);
		return util.chooseTargets(removeTargets.map(c => c.id), 1, false, (remove) => {
			if (remove == null) return cc(null);
			return cc({ targets: { remove } });
		});
	},
	use: (util, card, player, opponent) => (choice) => {
		util.remove(choice.targets.remove[0], player, opponent);
		card.activated = false;
	}
}