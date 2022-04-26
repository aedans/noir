// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "This can't be activated the turn after it is played.",
	type: () => "agent",
	colors: () => ["blue"],
	cost: () => ({ money: 20 }),
	rank: () => 1,
	play: (util, card, player, opponent) => () => card.number.aspiring = 2,
	turn: (util, card, player, opponent) =>	card.number.aspiring--,
	update: (util, card, player, opponent) => {
		if (card.number.aspiring > 0) {
			card.activated = true;
		}
	},
}