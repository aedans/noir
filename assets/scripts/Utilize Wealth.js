// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Additional cost: reveal two hidden green cards in your deck. Destroy ten cards.",
	type: () => "operation",
	colors: () => ["green"],
	cost: () => ({ money: 250 }),
	rank: () => 3,
	playChoice: (util, card, player, opponent) => (cc) => {
		const destroyTargets = [...opponent.deck, ...opponent.board].filter(c => c.revealed == true);
		return util.chooseTargets(destroyTargets.map(c => c.id), 10, true, (destroy) => {
			if (destroy == null) return cc(null);
			return cc({ targets: { destroy } });
		});
	},
	play: (util, card, player, opponent) => {
		const cards = player.deck
			.filter(c => util.getCardInfo(c, player, opponent).colors(util, c, player, opponent).includes("green"))
			.filter(c => c.id != card.id)
			.filter(c => !c.revealed);
		if (cards.length < 2) return null;
		return (choice) => {
			util.revealRandom(cards, player, opponent);
			util.revealRandom(cards, player, opponent);
			for (let i = 0; i < 10 && i < choice.targets.destroy.length; i++) {
				util.destroy(choice.targets.destroy[i], player, opponent);
			}
		}
	}
}