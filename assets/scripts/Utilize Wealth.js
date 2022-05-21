// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Additional cost: reveal two hidden green cards in your deck. Remove ten cards.",
	type: () => "operation",
	colors: () => ["green"],
	cost: () => ({ money: 250 }),
	rank: () => 3,
	playChoice: (util, card, player, opponent) => (cc) => {
		const removeTargets = util.filter([...opponent.deck, ...opponent.board], "revealed", player, opponent);
		return util.chooseTargets(removeTargets.map(c => c.id), 10, true, (remove) => {
			if (remove == null) return cc(null);
			return cc({ targets: { remove } });
		});
	},
	play: (util, card, player, opponent) => {
		const cards = util.filter(player.deck, "hidden green", player, opponent).filter(c => c.id != card.id);
		if (cards.length < 2) return null;
		return (choice) => {
			util.revealRandom(cards, player, opponent);
			util.revealRandom(cards, player, opponent);
			for (let i = 0; i < 10 && i < choice.targets.remove.length; i++) {
				util.remove(choice.targets.remove[i], player, opponent);
			}
		}
	}
}