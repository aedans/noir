// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Each turn: destroy another revealed agent.",
	type: () => "agent",
	colors: () => ["purple"],
	cost: () => ({ money: 80 }),
	rank: () => 3,
	turn: (util, card, player, opponent) => {
		const random = util.sample([...player.deck, ...player.board, ...opponent.deck, ...opponent.board]
			.filter(c => util.getCardInfo(c, player, opponent).type(util, c, player, opponent) == "agent")
			.filter(c => c.id != card.id)
			.filter(c => c.revealed));
		util.destroy(random.id, player, opponent);
	},
}