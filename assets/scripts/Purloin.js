// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Additional cost: destroy an agent in your deck. Reduce your opponent's money by $20, and gain money equal to the amount lost.",
	type: () => "operation",
	colors: () => ["purple"],
	cost: () => ({ money: 10 }),
	rank: () => 1,
	play: (util, card, player, opponent) => () => {
		const cards = player.deck.filter(c => util.getCardInfo(c, player, opponent).type(util, card, player, opponent) == "agent");
		util.destroyRandom(cards, player, opponent);
		if (opponent.money < 20) {
			player.money += opponent.money;
			opponent.money = 0;
		} else {
			opponent.money -= 20;
			player.money += 20;
		}
	}
}