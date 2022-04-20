// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "If this is in your deck and a rank 3 agent in your deck would be revealed, reveal this instead.",
	type: () => "agent",
	colors: () => ["blue"],
	cost: () => ({ money: 40 }),
	rank: () => 1,
	effects: {
		deck: (util, state, player, opponent) => (info) => ({
			...info,
			reveal: (util, card, player, opponent) => {
				if (info.rank(util, card, player, opponent) == 3 && !state.revealed) {
					card.revealed = false;
					util.reveal(state.id, player, opponent);
				} else if (info.reveal) {
					info.reveal(util, card, player, opponent);
				}
			}
		})
	}
}