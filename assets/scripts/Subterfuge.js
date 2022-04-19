// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Additional cost: destroy a purple agent in your deck. Steal an operation and put it hidden into your deck.",
	type: () => "operation",
	colors: () => ["purple"],
	cost: () => ({ money: 10 }),
	rank: () => 1,
	playChoice: (util, card, player, opponent) => (cc) => {
		const destroyTargets = [...opponent.deck, ...opponent.board]
			.filter(c => util.getCardInfo(c, player, opponent).type(util, c, player, opponent) == "operation")
			.filter(c => c.revealed == true);
		return util.chooseTargets(destroyTargets.map(c => c.id), 1, false, (destroy) => {
			if (destroy == null) return cc(null);
			return cc({ targets: { destroy } });
		});
	},
	play: (util, card, player, opponent) => {
		const cards = player.deck
			.filter(c => util.getCardInfo(c, player, opponent).type(util, c, player, opponent) == "agent")
			.filter(c => util.getCardInfo(c, player, opponent).colors(util, c, player, opponent).includes("purple"));
		if (cards.length == 0) return null;
		return (choice) => {
			util.destroyRandom(cards, player, opponent);
			const card = util.getCardState(choice.targets.destroy[0], player, opponent);
			util.destroy(card.id, player, opponent);
			player.deck.push({ ...card, revealed: false });
		}
	}
}