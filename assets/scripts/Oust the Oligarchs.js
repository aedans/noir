// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Additional cost: activate five orange agents. Destroy all revealed rank 3 agents you don't control.",
	type: () => "operation",
	colors: () => ["orange"],
	cost: () => ({ money: 20, agents: { orange: 5 } }),
	rank: () => 3,
	play: (util, card, player, opponent) => () => {
		const agents = util.filter([...opponent.board, ...opponent.deck], "revealed rank/3 agent", player, opponent);
		for (const agent of agents) {
			util.destroy(agent.id, player, opponent);
		}
	}
}