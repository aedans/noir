// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Additional cost: activate a purple agent. Whenever an agent in your deck is removed on your turn, gain $20.",
	type: () => "agent",
	colors: () => ["purple"],
	cost: () => ({ money: 50, agents: { purple: 1 } }),
	rank: () => 2,
	effects: {
		board: (util, card, you, opponent) => (info) => ({
			...info,
			destroy: (util, card, player, opponent) => {
				(info.destroy ?? (() => {}))(util, card, player, opponent);
				if (you.turn && you.graveyard.find(c => c.id == card.id) != null && util.getCardInfo(card, player, opponent).type(util, card, player, opponent) == "agent") {
					you.money += 20;
				}
			}
		})
	}
}