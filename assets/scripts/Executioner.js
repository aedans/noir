// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Additional cost: reveal a hidden rank 3 blue card from your deck. Activate this, pay $10: remove an agent.",
	type: () => "agent",
	colors: () => ["blue"],
	cost: () => ({ money: 50 }),
	rank: () => 2,
	play: (util, card, player, opponent) => {
		const cards = util.filter(player.deck, "hidden rank/3 blue", player, opponent);
		if (cards.length == 0) return null;
		return () => {
			util.revealRandom(cards, player, opponent);
		};
	},
	useCost: () => ({ money: 10 }),
	useChoice: (util, card, player, opponent) => (cc) => {
		const destroyTargets = util.filter([...opponent.deck, ...opponent.board], "revealed agent", player, opponent);
		return util.chooseTargets(destroyTargets.map(c => c.id), 1, false, (destroy) => {
			if (destroy == null) return cc(null);
			return cc({ targets: { destroy } });
		});
	},
	use: (util, card, player, opponent) => (choice) => {
		util.destroy(choice.targets.destroy[0], player, opponent);
	}
}