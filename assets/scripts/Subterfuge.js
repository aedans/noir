// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Additional cost: remove a purple agent in your deck. Steal an operation and put it hidden into your deck.",
	type: () => "operation",
	colors: () => ["purple"],
	cost: () => ({ money: 0 }),
	rank: () => 1,
	playChoice: (util, card, player, opponent) => (cc) => {
		const removeTargets = util.filter([...opponent.deck, ...opponent.board], "revealed operation", player, opponent);
		return util.chooseTargets(removeTargets.map(c => c.id), 1, false, (remove) => {
			if (remove == null) return cc(null);
			return cc({ targets: { remove } });
		});
	},
	play: (util, card, player, opponent) => {
		const cards = util.filter(player.deck, "purple agent", player, opponent);
		if (cards.length == 0) return null;
		return (choice) => {
			util.removeRandom(cards, player, opponent);
			const card = util.getCardState(choice.targets.remove[0], player, opponent);
			util.remove(card.id, player, opponent);
			player.deck.push({ ...card, revealed: false });
		}
	}
}