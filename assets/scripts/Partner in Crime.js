// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Activate this and another purple agent: steal a card from your opponent's deck, putting it hidden into your deck.",
	type: () => "agent",
	colors: () => ["purple"],
	cost: () => ({ money: 60 }),
	rank: () => 2,
	useCost: () => ({ money: 0, agents: { purple: 1 } }),
	use: (util, card, player, opponent) => () => {
		const card = util.sample(opponent.deck);
		util.remove(card.id, player, opponent);
		player.deck.push({ ...card, revealed: true });
	}
}