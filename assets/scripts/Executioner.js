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