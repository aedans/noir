// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Additonal cost: activate an agent of each color. Reveal all cards.",
	type: () => "operation",
	colors: () => [],
	cost: () => ({ money: 100, agents: { blue: 1, green: 1, orange: 1, purple: 1 }}),
	rank: () => 3,
	play: (util, card, player, opponent) => () => {
		for (const place of [player.deck, player.board, player.graveyard, opponent.board, opponent.deck, opponent.graveyard]) {
			for (const { id } of place) {
				util.reveal(id, player, opponent);
			}
		}
	}
}