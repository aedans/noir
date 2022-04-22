// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Additional cost: activate five blue agents. Destroy all revealed rank 1 agents you don't control.",
	type: () => "operation",
	colors: () => ["blue"],
	cost: () => ({ money: 40, agents: { blue: 5 } }),
	rank: () => 3,
	play: (util, card, player, opponent) => (choice) => {
		const agents = util.filter([...opponent.board, ...opponent.deck], "revealed rank/1 agent", player, opponent);
		for (const agent of agents) {
			util.destroy(agent.id, player, opponent);
		}
	}
}