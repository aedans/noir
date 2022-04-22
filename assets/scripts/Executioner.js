// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Additional cost: reveal a hidden rank 3 blue card from your deck. Activate this, reveal a hidden rank 3 card in your deck: destroy an agent.",
	type: () => "agent",
	colors: () => ["blue"],
	cost: () => ({ money: 50 }),
	rank: () => 3,
	play: (util, card, player, opponent) => {
		const cards = util.filter(player.deck, "hidden rank/3 blue", player, opponent);
		if (cards.length == 0) return null;
		return () => {
			util.revealRandom(cards, player, opponent);
		};
	},
	useChoice: (util, card, player, opponent) => (cc) => {
		const destroyTargets = util.filter([...opponent.deck, ...opponent.board], "revealed agent", player, opponent);
		return util.chooseTargets(destroyTargets.map(c => c.id), 1, false, (destroy) => {
			if (destroy == null) return cc(null);
			return cc({ targets: { destroy } });
		});
	},
	use: (util, card, player, opponent) => {
		const cards = util.filter(player.deck, "hidden rank/3", player, opponent);
		if (cards.length == 0) return null;
		return (choice) => {
			util.revealRandom(cards, player, opponent);
			util.destroy(choice.targets.destroy[0], player, opponent);
		};
	}
}