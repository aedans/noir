// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Additional cost: activate a green agent. Each turn: put an agent from your deck onto the board revealed.",
	type: () => "location",
	colors: () => ["green"],
	cost: () => ({ money: 85, agents: { green: 1 } }),
	rank: () => 3,
	turn: (util, card, player, opponent) => {
		const state = util.sample(util.filter(player.deck, "agent", player, opponent));
		if (state) {
			util.destroy(state.id, player, opponent);
			player.board.push({ ...state, revealed: true });
		}
	}
}