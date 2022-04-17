// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Additional cost: activate five orange agents. Destroy all revealed rank 3 agents you don't control.",
	type: () => "operation",
	colors: () => ["orange"],
	cost: () => ({ money: 20, agents: { orange: 5 } }),
	rank: () => 3,
	play: (util, card, player, opponent) => () => {
		const agents = [...opponent.board, ...opponent.deck]
			.filter(c => c.revealed)
			.filter(c => util.getCardInfo(c, player, opponent).rank(util, c, player, opponent) == 3)
			.filter(c => util.getCardInfo(c, player, opponent).type(util, c, player, opponent) == "agent");
		for (const agent of agents) {
			util.destroy(agent.id, player, opponent);
		}
	}
}