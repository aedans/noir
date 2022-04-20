// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Additional cost: activate an orange agent. If a player has fewer agents than the other player, reveal cards in their deck equal to the difference.",
	type: () => "operation",
	colors: () => ["orange"],
	cost: () => ({ money: 10, agents: { orange: 1 } }),
	rank: () => 1,
	play: (util, card, player, opponent) => () => {
		const playerAgents = player.board.filter(c => util.getCardInfo(c, player, opponent).type(util, c, player, opponent) == "agent").length;
		const opponentAgents = opponent.board.filter(c => util.getCardInfo(c, player, opponent).type(util, c, player, opponent) == "agent").length;
		if (playerAgents < opponentAgents) {
			for (let i = 0; i < opponentAgents - playerAgents; i++) {
				util.revealRandom(opponent.deck, player, opponent);
			}
		} else if (opponentAgents < playerAgents) {
			for (let i = 0; i < playerAgents - opponentAgents; i++) {
				util.revealRandom(player.deck, player, opponent);
			}
		}
	}
}