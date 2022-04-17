// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Additional cost: activate five blue agents. Destroy all revealed rank 1 agents you don't control.",
	type: () => "operation",
	colors: () => ["blue"],
	cost: () => ({ money: 40, agents: { blue: 5 } }),
	rank: () => 3,
	play: (util, card, player, opponent) => (choice) => {
		const agents = [...opponent.board, ...opponent.deck]
			.filter(c => c.revealed)
			.filter(c => util.getCardInfo(c, player, opponent).rank(util, c, player, opponent) <= 1)
			.filter(c => util.getCardInfo(c, player, opponent).type(util, c, player, opponent) == "agent");
		for (const agent of agents) {
			util.destroy(agent.id, player, opponent);
		}
	}
}