// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Activate Caravan Interlocutor: if it was hidden, gain $10 for each green agent on your board.",
	type: () => "agent",
	colors: () => ["green"],
	cost: () => ({ money: 50 }),
	rank: () => 1,
	use: (util, card, player, opponent) => () => {
		if (!card.revealed) {
			player.money += player.board
				.filter(c => util.getCardInfo(c, player, opponent).colors(util, c, player, opponent).includes("green"))
				.filter(c => util.getCardInfo(c, player, opponent).type(util, card, player, opponent) == "agent")
				.length * 10;
		}
	}
}