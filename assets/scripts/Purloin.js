// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Additional cost: destroy a purple agent in your deck. Steal $10 from your opponent.",
	type: () => "operation",
	colors: () => ["purple"],
	cost: () => ({ money: 10 }),
	rank: () => 1,
	play: (util, card, player, opponent) => () => {
    const cards = util.filter(player.deck, "agent", player, opponent);
		util.destroyRandom(cards, player, opponent);
		if (opponent.money < 10) {
			player.money += opponent.money;
			opponent.money = 0;
		} else {
			opponent.money -= 10;
			player.money += 10;
		}
	}
}