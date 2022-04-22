// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Additional cost: reveal two hidden green cards in your deck. Destroy ten cards.",
	type: () => "operation",
	colors: () => ["green"],
	cost: () => ({ money: 250 }),
	rank: () => 3,
	playChoice: (util, card, player, opponent) => (cc) => {
		const destroyTargets = util.filter([...opponent.deck, ...opponent.board], "revealed", player, opponent);
		return util.chooseTargets(destroyTargets.map(c => c.id), 10, true, (destroy) => {
			if (destroy == null) return cc(null);
			return cc({ targets: { destroy } });
		});
	},
	play: (util, card, player, opponent) => {
		const cards = util.filter(player.deck, "hidden green", player, opponent).filter(c => c.id != card.id);
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