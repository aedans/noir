// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Additional cost: reveal a hidden rank 3 blue card from your deck. Activate this, reveal a hidden rank 3 card in your deck: destroy an agent.",
	type: () => "agent",
	colors: () => ["blue"],
	cost: () => ({ money: 50 }),
	rank: () => 3,
	play: (util, card, player, opponent) => {
		const cards = player.deck
			.filter(c => util.getCardInfo(c, player, opponent).rank(util, c, player, opponent) == 3)
			.filter(c => util.getCardInfo(c, player, opponent).colors(util, c, player, opponent).includes("blue"))
			.filter(c => !c.revealed);
		if (cards.length == 0) return null;
		return () => {
			util.revealRandom(cards, player, opponent);
		};
	},
	useChoice: (util, card, player, opponent) => (cc) => {
		const destroyTargets = [...opponent.deck, ...opponent.board]
			.filter(c => util.getCardInfo(c, player, opponent).type(util, c, player, opponent) == "agent")
			.filter(c => c.revealed == true);
		return util.chooseTargets(destroyTargets.map(c => c.id), 1, false, (destroy) => {
			if (destroy == null) return cc(null);
			return cc({ targets: { destroy } });
		});
	},
	use: (util, card, player, opponent) => {
		const cards = player.deck
			.filter(c => util.getCardInfo(c, player, opponent).rank(util, c, player, opponent) == 3)
			.filter(c => !c.revealed);
		if (cards.length == 0) return null;
		return (choice) => {
			util.revealRandom(cards, player, opponent);
			util.destroy(choice.targets.destroy[0], player, opponent);
		};
	}
}