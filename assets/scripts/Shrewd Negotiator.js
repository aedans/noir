// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Additonal cost: activate an orange agent. Whenever an agent on your board is revealed, reveal a hidden card on your opponent's board.",
	type: () => "agent",
	colors: () => ["orange"],
	cost: () => ({ money: 60, agents: { orange: 1 } }),
	rank: () => 3,
	effects: {
		board: (util, card, player, opponent) => (info) => ({
			...info,
			reveal: (util, card, player, opponent) => {
				if (player.board.find(c => c.id == card.id)) {
					util.revealRandom(opponent.board, player, opponent);
				}
			}
		})
	}
}