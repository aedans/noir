// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "If this is hidden and another card on your board would be revealed, instead reveal this.",
	type: () => "agent",
	colors: () => [],
	cost: () => ({ money: 25 }),
	rank: () => 1,
	effects: {
		board: (util, state, player, opponent) => (info) => ({
			...info,
			reveal: (util, card, player, opponent) => {
				if (!state.revealed) {
					card.revealed = false;
					util.reveal(state.id, player, opponent);
				} else if (info.reveal) {
					info.reveal(util, card, player, opponent);
				}
			}
		})
	}
}