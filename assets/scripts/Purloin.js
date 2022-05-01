// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Additional cost: activate a purple agent. Steal $20 from your opponent.",
	type: () => "operation",
	colors: () => ["purple"],
	cost: () => ({ money: 10, agents: { purple: 1 } }),
	rank: () => 1,
	play: (util, card, player, opponent) => () => {
		if (opponent.money < 20) {
			player.money += opponent.money;
			opponent.money = 0;
		} else {
			opponent.money -= 20;
			player.money += 20;
		}
	}
}