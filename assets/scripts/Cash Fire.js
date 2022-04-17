// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Additional cost: activate five orange agents and reveal all orange agents from your deck. Set each player's money equal to $0.",
	type: () => "operation",
	colors: () => ["orange"],
	cost: () => ({ money: 0, agents: { orange: 5 } }),
	rank: () => 3,
	play: (util, card, player, opponent) => () => {
		const agents = player.deck
			.filter(c => util.getCardInfo(c, player, opponent).colors(util, c, player, opponent).includes("orange"))
			.filter(c => util.getCardInfo(c, player, opponent).type(util, c, player, opponent) == "agent")
			.filter(c => !c.revealed);
		for (const agent of agents) {
			util.reveal(agent.id, player, opponent);
		}

		player.money = 0;
		opponent.money = 0;
	}
}