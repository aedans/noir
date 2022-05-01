// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Activate this: remove a hidden agent in your deck and gain $30. If it's purple, gain $40 instead.",
	type: () => "location",
	colors: () => ["purple"],
	cost: () => ({ money: 75 }),
	rank: () => 2,
	useCost: () => ({ money: 0 }),
	use: (util, card, player, opponent) => () => {
		const agent = util.sample(util.filter(player.deck, "hidden agent", player, opponent));
		if (agent) {
			util.destroy(agent.id, player, opponent);
			if (util.getCardInfo(agent, player, opponent).colors(util, agent, player, opponent).includes("purple")) {
				player.money += 40;
			} else {
				player.money += 30;
			}
		}
	}
}