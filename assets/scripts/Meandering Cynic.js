// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "When you play this, reveal it.",
	type: () => "agent",
	colors: () => ["orange"],
	cost: () => ({ money: 20 }),
	rank: () => 1,
	play: (util, card, player, opponent) => () => {
		util.reveal(card.id, player, opponent);
	}
}